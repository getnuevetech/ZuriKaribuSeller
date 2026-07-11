import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'placeholder',
  });
}

export async function optimizeProductDescription(
  productName: string,
  currentDescription: string,
  fabricsUsed: string[],
  sellerType: string
): Promise<string> {
  const prompt = `You are an expert fashion & textile copywriter for an African fashion marketplace called ZuriKaribu.

Optimize the following product description to be more compelling, SEO-friendly, and appealing to international buyers interested in African fashion.

Product Name: ${productName}
Seller Type: ${sellerType}
Fabrics Used: ${fabricsUsed.join(', ')}
Current Description: ${currentDescription}

Requirements:
- Highlight the cultural significance of the fabrics
- Make it engaging and professional
- Include relevant keywords for SEO
- Keep it between 150-250 words
- Emphasize the uniqueness of African fashion

Return only the optimized description, no additional commentary.`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || currentDescription;
}

export async function generateProductTags(
  productName: string,
  description: string,
  fabricsUsed: string[]
): Promise<string[]> {
  const prompt = `Generate 10 relevant hashtags and SEO tags for this African fashion product listing.

Product: ${productName}
Description: ${description}
Fabrics: ${fabricsUsed.join(', ')}

Return only a JSON array of tags (without # symbol), no additional text.
Example: ["africanfashion", "ankara", "handmade"]`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.5,
  });

  try {
    const content = response.choices[0]?.message?.content || '[]';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleaned);
  } catch {
    return ['africanfashion', 'handmade', 'africanprint'];
  }
}

export async function generateSocialMediaCaption(
  productName: string,
  description: string,
  platform: 'instagram' | 'facebook' | 'tiktok',
  sellingPrice: number
): Promise<string> {
  const platformGuide = {
    instagram: 'engaging, emoji-rich, with 5-8 hashtags',
    facebook: 'conversational and friendly, 2-3 sentences with a call to action',
    tiktok: 'trendy, short, with trending hashtags and emojis',
  };

  const prompt = `Create a ${platform} caption for this African fashion product.

Product: ${productName}
Description: ${description}
Price: $${sellingPrice}
Style: ${platformGuide[platform]}

Return only the caption text.`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || description;
}

export async function analyzeProductImage(imageUrl: string): Promise<{
  colors: string[];
  style: string;
  suggestions: string[];
}> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `Analyze this African fashion product image and return a JSON object with:
- colors: array of main colors (max 5)
- style: brief style description
- suggestions: array of 3 suggestions to improve the product listing

Return only valid JSON, no markdown.`,
          },
        ],
      },
    ],
    max_tokens: 400,
  });

  try {
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch {
    return {
      colors: [],
      style: 'African fashion piece',
      suggestions: ['Use better lighting', 'Show product from multiple angles', 'Include close-up of fabric texture'],
    };
  }
}
