'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { cn, FABRIC_OPTIONS } from '@/lib/utils';

function getS3PublicUrl(key: string): string {
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

interface UploadedImage {
  url: string;
  s3Key: string;
  preview: string;
  uploading?: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    fabricsUsed: [] as string[],
    costPrice: '',
    sellingPrice: '',
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [submitError, setSubmitError] = useState('');

  function toggleFabric(fabric: string) {
    setForm((prev) => ({
      ...prev,
      fabricsUsed: prev.fabricsUsed.includes(fabric)
        ? prev.fabricsUsed.filter((f) => f !== fabric)
        : [...prev.fabricsUsed, fabric],
    }));
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > 5) {
      setErrors((e) => ({ ...e, images: 'Maximum 5 images allowed' }));
      return;
    }

    const newImages = acceptedFiles.map((file) => ({
      url: '',
      s3Key: '',
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...newImages]);
    const startIdx = images.length;

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      try {
        // Get presigned URL
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const { key, uploadUrl } = await res.json();

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        const publicUrl = getS3PublicUrl(key);

        setImages((prev) => {
          const updated = [...prev];
          updated[startIdx + i] = {
            url: publicUrl,
            s3Key: key,
            preview: URL.createObjectURL(file),
            uploading: false,
          };
          return updated;
        });
      } catch {
        setImages((prev) => {
          const updated = [...prev];
          updated.splice(startIdx + i, 1);
          return updated;
        });
        setErrors((e) => ({ ...e, images: 'Failed to upload image. Please try again.' }));
      }
    }
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 5,
    disabled: images.length >= 5,
  });

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAiOptimize() {
    if (!form.name || !form.description) {
      setErrors((e) => ({ ...e, description: 'Add a name and description first' }));
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_description',
          productName: form.name,
          description: form.description,
          fabricsUsed: form.fabricsUsed,
        }),
      });
      const data = await res.json();
      setAiDescription(data.optimized);
    } catch {
      setErrors((e) => ({ ...e, ai: 'AI optimization failed. Please try again.' }));
    }
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.name) newErrors.name = 'Product name is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (form.fabricsUsed.length === 0) newErrors.fabricsUsed = 'Select at least one fabric';
    if (!form.costPrice) newErrors.costPrice = 'Cost price is required';
    if (!form.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
    const completedImages = images.filter((img) => !img.uploading && img.url);
    if (completedImages.length < 3) newErrors.images = `At least 3 images required (${completedImages.length} uploaded)`;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          description: aiDescription || form.description,
          images: completedImages.map((img) => ({ url: img.url, s3Key: img.s3Key })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to create product');
        setLoading(false);
        return;
      }

      router.push('/dashboard/products');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const completedImages = images.filter((img) => !img.uploading && img.url);
  const imageProgress = Math.min(100, (completedImages.length / 3) * 100);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-stone-500 hover:text-stone-800">
            ← Back
          </button>
          <h1 className="font-black text-stone-900 text-lg">Add New Product</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Images */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-bold text-stone-900 mb-1">Product Images</h2>
            <p className="text-stone-500 text-sm mb-4">
              Upload 3–5 high-quality photos of your product.{' '}
              <span className={completedImages.length >= 3 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                {completedImages.length}/5 uploaded (min. 3)
              </span>
            </p>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 rounded-full h-1.5 mb-4">
              <div
                className={cn('h-1.5 rounded-full transition-all', completedImages.length >= 3 ? 'bg-green-500' : 'bg-amber-500')}
                style={{ width: `${imageProgress}%` }}
              />
            </div>

            {/* Uploaded Images Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mb-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                    {!img.uploading && (
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                    {i === 0 && !img.uploading && (
                      <div className="absolute bottom-1 left-1 bg-amber-500 text-white text-xs px-1.5 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                )}
              >
                <input {...getInputProps()} />
                <div className="text-3xl mb-3">📸</div>
                <p className="text-stone-700 font-medium">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-stone-400 text-sm mt-1">or click to browse • JPEG, PNG, WebP</p>
              </div>
            )}

            {errors.images && <p className="text-xs text-red-500 mt-2">{errors.images}</p>}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <h2 className="font-bold text-stone-900">Product Details</h2>
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={errors.name}
              placeholder="e.g. Ankara Wrap Dress, Kente Print Blazer"
              required
            />

            <div className="space-y-2">
              <Textarea
                label="Product Description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                error={errors.description}
                placeholder="Describe your product in detail — style, fit, occasion, care instructions..."
                required
                rows={5}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiOptimize}
                  loading={aiLoading}
                  disabled={!form.name || !form.description}
                >
                  🤖 Optimize with AI
                </Button>
                <span className="text-stone-400 text-xs">Let AI improve your description</span>
              </div>
              {aiDescription && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 text-sm font-medium">✨ AI Optimized Version</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((p) => ({ ...p, description: aiDescription }));
                        setAiDescription('');
                      }}
                      className="text-amber-600 text-xs hover:underline"
                    >
                      Use this version
                    </button>
                  </div>
                  <p className="text-stone-700 text-sm">{aiDescription}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Fabrics Used <span className="text-red-500">*</span>
              </label>
              {errors.fabricsUsed && <p className="text-xs text-red-500 mb-2">{errors.fabricsUsed}</p>}
              <div className="flex flex-wrap gap-2">
                {FABRIC_OPTIONS.map((fabric) => (
                  <button
                    key={fabric}
                    type="button"
                    onClick={() => toggleFabric(fabric)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      form.fabricsUsed.includes(fabric)
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    )}
                  >
                    {fabric}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <h2 className="font-bold text-stone-900">Pricing</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Cost Price (USD)"
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) => setForm((p) => ({ ...p, costPrice: e.target.value }))}
                error={errors.costPrice}
                placeholder="0.00"
                required
                hint="What it costs you to make/source"
              />
              <Input
                label="Selling Price (USD)"
                type="number"
                step="0.01"
                min="0"
                value={form.sellingPrice}
                onChange={(e) => setForm((p) => ({ ...p, sellingPrice: e.target.value }))}
                error={errors.sellingPrice}
                placeholder="0.00"
                required
                hint="Your listed price for customers"
              />
            </div>
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-sm text-stone-500">
                💡 <strong>Platform Price</strong> is calculated automatically based on your selling price
                plus a platform markup. This is set by the admin and is not visible to buyers.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pb-8">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} size="lg">
              Create Product
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
