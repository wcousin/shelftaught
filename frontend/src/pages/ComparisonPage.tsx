import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Curriculum } from '../types';
import { ComparisonTable } from '../components';

const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || [];
    
    if (ids.length === 0) {
      setError('No curricula selected for comparison');
      setLoading(false);
      return;
    }

    const fetchCurricula = async () => {
      try {
        const promises = ids.map(id => api.getCurriculumById(id));
        const responses = await Promise.all(promises);
        const curriculaData = responses.map(response => response.data.curriculum || response.data.data);
        setCurricula(curriculaData);
      } catch (err: any) {
        setError('Failed to load curricula for comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchCurricula();
  }, [searchParams]);

  const handleRemoveCurriculum = (id: string) => {
    const updatedCurricula = curricula.filter(c => c.id !== id);
    setCurricula(updatedCurricula);
    
    if (updatedCurricula.length === 0) {
      navigate('/browse');
      return;
    }
    
    // Update URL with remaining IDs
    const remainingIds = updatedCurricula.map(c => c.id).join(',');
    navigate(`/compare?ids=${remainingIds}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error}
            </h1>
            <button
              onClick={() => navigate('/browse')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Curricula
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Curriculum Comparison
          </h1>
          <p className="text-gray-600">
            Compare {curricula.length} curricula side by side to find the best fit for your needs.
          </p>
        </div>

        <ComparisonTable 
          curricula={curricula}
          onRemove={handleRemoveCurriculum}
          className="mb-8"
        />

        <div className="text-center">
          <button
            onClick={() => navigate('/browse')}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors mr-4"
          >
            Back to Browse
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Print Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;