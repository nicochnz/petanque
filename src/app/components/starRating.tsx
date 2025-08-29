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
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={`${sizeClasses[size]} ${filled ? 'text-secondary' : 'text-light-dark'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRate) {
      onRate(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayRating;
      stars.push(
        <button
          key={i}
          type="button"
          disabled={readonly}
          className={`${
            readonly 
              ? 'cursor-default' 
              : 'cursor-pointer hover:scale-110 transition-transform'
          }`}
          onMouseEnter={() => !readonly && setHoveredRating(i)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          onClick={() => handleStarClick(i)}
        >
          <StarIcon filled={isFilled} />
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
        <span className="text-sm text-dark/70">
          {rating.toFixed(1)} {count !== undefined && `(${count} avis)`}
        </span>
      )}
      {!readonly && rating === 0 && (
        <span className="text-sm text-dark/50">
          Soyez le premier à noter !
        </span>
      )}
    </div>
  );
}