import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { createCurriculumUrl } from '../../utils/url';

interface SavedCurriculum {
  id: string;
  personalNotes: string | null;
  savedAt: string;
  curriculum: {
    id: string;
    name: string;
    publisher: string;
    description: string;
    imageUrl?: string;
    overallRating: number;
    gradeLevel: {
      name: string;
    };
    subjects: Array<{
      name: string;
    }>;
    teachingApproachStyle: string;
    costPriceRange: string;
    timeCommitmentDailyMinutes: number;
  };
}

interface SavedCurriculumCardProps {
  savedCurriculum: SavedCurriculum;
  onRemove: (id: string) => void;
  onNotesUpdate: (id: string, notes: string) => void;
}

export const SavedCurriculumCard: React.FC<SavedCurriculumCardProps> = ({
  savedCurriculum,
  onRemove,
  onNotesUpdate,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(savedCurriculum.personalNotes || '');
  const [isLoading, setIsLoading] = useState(false);

  const { curriculum } = savedCurriculum;

  const handleSaveNotes = async () => {
    setIsLoading(true);
    try {
      await api.saveCurriculum(curriculum.id, notes);
      onNotesUpdate(savedCurriculum.id, notes);
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNotes(savedCurriculum.personalNotes || '');
    setIsEditingNotes(false);
  };

  const handleRemove = async () => {
    if (window.confirm(`Remove "${curriculum.name}" from your saved list?`)) {
      try {
        await api.removeSavedCurriculum(savedCurriculum.id);
        onRemove(savedCurriculum.id);
      } catch (error) {
        console.error('Failed to remove curriculum:', error);
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Curriculum Image */}
        <div className="flex-shrink-0">
          {curriculum.imageUrl ? (
            <img
              src={curriculum.imageUrl}
              alt={curriculum.name}
              className="w-24 h-32 object-cover rounded-md"
            />
          ) : (
            <div className="w-24 h-32 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center">No Image</span>
            </div>
          )}
        </div>

        {/* Curriculum Info */}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <Link
                to={createCurriculumUrl(curriculum.id, curriculum.name, curriculum.publisher)}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600"
              >
                {curriculum.name}
              </Link>
              <p className="text-sm text-gray-600">{curriculum.publisher}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">{renderStars(Math.round(curriculum.overallRating))}</div>
            <span className="text-sm text-gray-600">
              {curriculum.overallRating.toFixed(1)}
            </span>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <span>Grade: {curriculum.gradeLevel.name}</span>
            <span>Style: {curriculum.teachingApproachStyle}</span>
            <span>Cost: {curriculum.costPriceRange}</span>
            <span>Time: {curriculum.timeCommitmentDailyMinutes} min/day</span>
          </div>

          {/* Subjects */}
          <div className="flex flex-wrap gap-1 mb-3">
            {curriculum.subjects.slice(0, 3).map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {subject.name}
              </span>
            ))}
            {curriculum.subjects.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{curriculum.subjects.length - 3} more
              </span>
            )}
          </div>

          {/* Personal Notes */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Personal Notes</h4>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {savedCurriculum.personalNotes ? 'Edit' : 'Add Notes'}
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your personal notes about this curriculum..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {notes.length}/1000 characters
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isLoading}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {savedCurriculum.personalNotes || 'No notes added yet.'}
              </p>
            )}
          </div>

          {/* Saved Date */}
          <div className="text-xs text-gray-400 mt-2">
            Saved on {new Date(savedCurriculum.savedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};