'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  /** When set, renders interactive buttons that call back with the picked rating. */
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = { sm: 'size-3.5', md: 'size-5', lg: 'size-7' } as const;

/** Five-star display, or an interactive picker when `onChange` is provided. */
export function StarRating({ value, onChange, size = 'md', className }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = Boolean(onChange);
  const shown = hover || value;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(shown);
        const icon = (
          <Star
            className={cn(
              SIZE[size],
              filled ? 'fill-brand-orange text-brand-orange' : 'text-muted-foreground/40',
            )}
          />
        );
        if (!interactive) return <span key={star}>{icon}</span>;
        return (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange?.(star)}
            aria-label={`${star}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
