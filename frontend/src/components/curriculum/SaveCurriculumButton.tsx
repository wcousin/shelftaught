import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface SaveCurriculumButtonProps {
  curriculumId: string;
  className?: string;
}

export const SaveCurriculumButton: React.FC<SaveCurriculumButtonProps> = ({
  curriculumId,
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkIfSaved();
    }
  }, [isAuthenticated, curriculumId]);

  const checkIfSaved = async () => {
    try {
      const response = await api.getSavedCurricula();
      const savedCurricula = response.data.savedCurricula;
      const saved = savedCurricula.find(
        (item: any) => item.curriculum.id === curriculumId
      );
      
      if (saved) {
        setIsSaved(true);
        setSavedId(saved.id);
      }
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSaved && savedId) {
        // Remove from saved
        await api.removeSavedCurriculum(savedId);
        setIsSaved(false);
        setSavedId(null);
      } else {
        // Add to saved
        const response = await api.saveCurriculum(curriculumId);
        setIsSaved(true);
        setSavedId(response.data.savedCurriculum.id);
      }
    } catch (error) {
      console.error('Failed to toggle save status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleToggleSave}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        Save Curriculum
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        isSaved
          ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      } ${className}`}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {isLoading
        ? 'Saving...'
        : isSaved
        ? 'Saved'
        : 'Save Curriculum'
      }
    </button>
  );
};