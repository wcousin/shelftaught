import React from 'react';
import { useInView } from 'react-intersection-observer';
import CurriculumCard from './CurriculumCard';

interface LazyCurriculumCardProps {
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

const LazyCurriculumCard: React.FC<LazyCurriculumCardProps> = (props) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px'
  });

  return (
    <div ref={ref} className="min-h-[300px]">
      {inView ? (
        <CurriculumCard {...props} />
      ) : (
        // Skeleton placeholder
        <div className="bg-white rounded-lg shadow-md animate-pulse">
          <div className="p-6">
            <div className="mb-4">
              <div className="w-full h-32 bg-gray-300 rounded-md"></div>
            </div>
            <div className="mb-2">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="mb-3">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
            </div>
            <div className="mb-3">
              <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              <div className="h-6 bg-gray-300 rounded-full w-20"></div>
              <div className="h-6 bg-gray-300 rounded-full w-14"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyCurriculumCard;