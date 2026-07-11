'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-stone-100 shadow-sm',
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-6 py-4 border-b border-stone-100', className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl', className)}>
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-stone-100 text-stone-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  positive?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, change, positive, className }: StatCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{title}</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1', positive ? 'text-green-600' : 'text-red-500')}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
