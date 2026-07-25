import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onChange, size = 16 }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={star <= display ? 'fill-brand text-brand' : 'fill-none text-stone-300'}
          />
        </button>
      ))}
    </div>
  );
}
