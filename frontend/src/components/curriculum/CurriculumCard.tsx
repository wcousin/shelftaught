import React from 'react';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../LazyImage';
import { createCurriculumUrl } from '../../utils/url';

interface CurriculumCardProps {
  id: string;
  name: string;
  publisher: string;
  description: string;
  overallRating: number;
  imageUrl?: string;
  subjects: string[];
  gradeRange: string;
  onClick?: () => void;
}

const CurriculumCard: React.FC<CurriculumCardProps> = ({
  id,
  name,
  publisher,
  description,
  overallRating,
  imageUrl,
  subjects,
  gradeRange,
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const seoUrl = createCurriculumUrl(id, name, publisher);
      navigate(seoUrl);
    }
  };
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer touch-manipulation active:scale-95 transform transition-transform"
      onClick={handleClick}
    >
      <div className="p-4 sm:p-6">
        <div className="mb-3 sm:mb-4">
          <LazyImage
            src={imageUrl || '/images/placeholder.svg'}
            alt={`${name} by ${publisher}`}
            className="w-full h-24 sm:h-32 rounded-md object-cover bg-gray-100"
          />
        </div>
        
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{publisher}</p>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center mb-1">
            {renderStars(Math.round(overallRating))}
            <span className="ml-2 text-xs sm:text-sm text-gray-600">
              {overallRating.toFixed(1)}
            </span>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          {subjects.slice(0, 3).map((subject, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {subject}
            </span>
          ))}
          {subjects.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{subjects.length - 3} more
            </span>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Grade: {gradeRange}
        </div>
      </div>
    </div>
  );
};

export default CurriculumCard;