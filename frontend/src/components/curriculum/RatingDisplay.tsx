import React from 'react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
  variant?: 'stars' | 'bar' | 'compact';
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  label,
  variant = 'stars',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= maxRating; i++) {
      let starClass = 'text-gray-300';
      if (i <= fullStars) {
        starClass = 'text-yellow-400';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = 'text-yellow-400';
      }
      
      stars.push(
        <span
          key={i}
          className={`${sizeClasses[size]} ${starClass}`}
        >
          {i <= fullStars ? '★' : (i === fullStars + 1 && hasHalfStar ? '☆' : '☆')}
        </span>
      );
    }
    return stars;
  };

  const renderBar = () => {
    const percentage = (rating / maxRating) * 100;
    return (
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {showValue && (
          <span className="text-sm text-gray-600 min-w-[3rem]">
            {rating.toFixed(1)}/{maxRating}
          </span>
        )}
      </div>
    );
  };

  const renderCompact = () => {
    return (
      <div className="flex items-center space-x-1">
        <span className="text-yellow-400">★</span>
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
        {showValue && (
          <span className="text-xs text-gray-500">
            /{maxRating}
          </span>
        )}
      </div>
    );
  };

  const renderRating = () => {
    switch (variant) {
      case 'bar':
        return renderBar();
      case 'compact':
        return renderCompact();
      default:
        return (
          <div className="flex items-center">
            {renderStars()}
            {showValue && (
              <span className="ml-2 text-sm text-gray-600">
                {rating.toFixed(1)}/{maxRating}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && variant !== 'compact' && (
        <span className="text-sm font-medium text-gray-700">{label}:</span>
      )}
      {variant === 'compact' && label && (
        <span className="text-sm text-gray-600">{label}:</span>
      )}
      {renderRating()}
    </div>
  );
};

export default RatingDisplay;