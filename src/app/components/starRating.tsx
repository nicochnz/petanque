'use client';

import { useState } from 'react';

type StarRatingProps = {
  rating: number;
  count?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export default function StarRating({ rating, count, onRate, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRate) {
      onRate(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoveredRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          disabled={readonly}
          className={`${sizeClasses[size]} ${
            readonly 
              ? 'cursor-default' 
              : 'cursor-pointer hover:scale-110 transition-transform'
          }`}
          onMouseEnter={() => !readonly && setHoveredRating(i)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          onClick={() => handleStarClick(i)}
        >
          <span className={isFilled ? 'text-amber-400' : 'text-gray-300'}>
            ⭐
          </span>
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {renderStars()}
      </div>
      {rating > 0 && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} {count !== undefined && `(${count} avis)`}
        </span>
      )}
      {!readonly && rating === 0 && (
        <span className="text-sm text-gray-500">
          Soyez le premier à noter !
        </span>
      )}
    </div>
  );
}