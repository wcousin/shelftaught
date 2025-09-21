import React from 'react';
import type { Curriculum } from '../../types';
import RatingDisplay from './RatingDisplay';

interface ComparisonTableProps {
  curricula: Curriculum[];
  onRemove?: (id: string) => void;
  className?: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  curricula,
  onRemove,
  className = ''
}) => {
  if (curricula.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-8 text-center ${className}`}>
        <p className="text-gray-500">No curricula selected for comparison</p>
      </div>
    );
  }

  const renderPriceRange = (priceRange: string) => {
    const symbols = {
      '$': '$0 - $50',
      '$$': '$50 - $150', 
      '$$$': '$150 - $300',
      '$$$$': '$300+'
    };
    return symbols[priceRange as keyof typeof symbols] || priceRange;
  };

  const comparisonRows = [
    {
      label: 'Overall Rating',
      getValue: (curriculum: Curriculum) => (
        <RatingDisplay rating={curriculum.overallRating} variant="compact" />
      )
    },
    {
      label: 'Publisher',
      getValue: (curriculum: Curriculum) => curriculum.publisher
    },
    {
      label: 'Grade Range',
      getValue: (curriculum: Curriculum) => curriculum.targetAgeGrade.gradeRange
    },
    {
      label: 'Age Range',
      getValue: (curriculum: Curriculum) => 
        `${curriculum.targetAgeGrade.minAge} - ${curriculum.targetAgeGrade.maxAge} years`
    },
    {
      label: 'Teaching Approach',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="font-medium">{curriculum.teachingApproach.style}</div>
          <RatingDisplay rating={curriculum.teachingApproach.rating} variant="compact" />
        </div>
      )
    },
    {
      label: 'Subjects',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="text-sm mb-1">
            {curriculum.subjectsCovered.subjects.slice(0, 3).join(', ')}
            {curriculum.subjectsCovered.subjects.length > 3 && 
              ` +${curriculum.subjectsCovered.subjects.length - 3} more`
            }
          </div>
          <RatingDisplay rating={curriculum.subjectsCovered.rating} variant="compact" />
        </div>
      )
    },
    {
      label: 'Instruction Style',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="font-medium">{curriculum.instructionStyle.type}</div>
          <RatingDisplay rating={curriculum.instructionStyle.rating} variant="compact" />
        </div>
      )
    },
    {
      label: 'Time Commitment',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="text-sm">{curriculum.timeCommitment.dailyMinutes} min/day</div>
          <div className="text-sm">{curriculum.timeCommitment.weeklyHours} hrs/week</div>
          <RatingDisplay rating={curriculum.timeCommitment.rating} variant="compact" />
        </div>
      )
    },
    {
      label: 'Cost',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="font-medium">{renderPriceRange(curriculum.cost.priceRange)}</div>
          <RatingDisplay rating={curriculum.cost.rating} variant="compact" />
        </div>
      )
    },
    {
      label: 'Materials',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="text-sm mb-1">
            {curriculum.materialsIncluded.components.slice(0, 2).join(', ')}
            {curriculum.materialsIncluded.components.length > 2 && 
              ` +${curriculum.materialsIncluded.components.length - 2} more`
            }
          </div>
          <RatingDisplay rating={curriculum.materialsIncluded.rating} variant="compact" />
        </div>
      )
    },
    {
      label: 'Availability',
      getValue: (curriculum: Curriculum) => (
        <div>
          <div className="flex items-center space-x-2 text-sm mb-1">
            <span className={`w-2 h-2 rounded-full ${curriculum.availability.inPrint ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>In Print</span>
          </div>
          <div className="flex items-center space-x-2 text-sm mb-1">
            <span className={`w-2 h-2 rounded-full ${curriculum.availability.digitalAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Digital</span>
          </div>
          <RatingDisplay rating={curriculum.availability.rating} variant="compact" />
        </div>
      )
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Curriculum Comparison
        </h3>
      </div>
      
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {curricula.map((curriculum) => (
          <div key={curriculum.id} className="border-b border-gray-200 last:border-b-0">
            <div className="px-4 py-4 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {curriculum.imageUrl && (
                  <img
                    src={curriculum.imageUrl}
                    alt={curriculum.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{curriculum.name}</h4>
                  <p className="text-xs text-gray-600">{curriculum.publisher}</p>
                </div>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(curriculum.id)}
                  className="text-red-500 hover:text-red-700 p-2 touch-manipulation"
                  title="Remove from comparison"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="px-4 py-3 space-y-3">
              {comparisonRows.map((row, index) => (
                <div key={index} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600 w-1/3">{row.label}</span>
                  <div className="text-sm text-gray-900 w-2/3 text-right">
                    {row.getValue(curriculum)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              {curricula.map((curriculum) => (
                <th key={curriculum.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm normal-case">
                        {curriculum.name}
                      </div>
                      {curriculum.imageUrl && (
                        <img
                          src={curriculum.imageUrl}
                          alt={curriculum.name}
                          className="w-16 h-16 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(curriculum.id)}
                        className="text-red-500 hover:text-red-700 ml-2 touch-manipulation"
                        title="Remove from comparison"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisonRows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.label}
                </td>
                {curricula.map((curriculum) => (
                  <td key={curriculum.id} className="px-6 py-4 text-sm text-gray-700">
                    {row.getValue(curriculum)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {curricula.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Available
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Not Available
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              Rating out of 5
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;