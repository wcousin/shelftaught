import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ReviewForm from './ReviewForm';
import type { Curriculum } from '../../types';

interface CurriculumWithActions extends Curriculum {
  _count?: {
    savedBy: number;
  };
}

const CurriculumManagement: React.FC = () => {
  const [curricula, setCurricula] = useState<CurriculumWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCurricula = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await api.get('/admin/curricula', {
        params: {
          page,
          limit: 10,
          search: search || undefined
        }
      });
      
      if (response.data.success) {
        setCurricula(response.data.curricula);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch curricula');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurricula(1, searchTerm);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCurricula(1, searchTerm);
  };

  const handleEdit = (curriculum: Curriculum) => {
    setEditingCurriculum(curriculum);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this curriculum? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/curricula/${id}`);
      await fetchCurricula(currentPage, searchTerm);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete curriculum');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCurriculum(null);
    fetchCurricula(currentPage, searchTerm);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCurriculum(null);
  };

  if (showForm) {
    return (
      <ReviewForm
        curriculum={editingCurriculum}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Curriculum Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Curriculum
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search curricula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Curricula Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {curricula.map((curriculum) => (
                <li key={curriculum.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        {curriculum.imageUrl && (
                          <img
                            src={curriculum.imageUrl}
                            alt={curriculum.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {curriculum.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {curriculum.publisher} • Rating: {curriculum.overallRating.toFixed(1)}/5
                          </p>
                          <p className="text-xs text-gray-400">
                            Created: {new Date(curriculum.createdAt).toLocaleDateString()}
                            {curriculum._count && ` • Saved by ${curriculum._count.savedBy} users`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(curriculum)}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(curriculum.id)}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => fetchCurricula(currentPage - 1, searchTerm)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchCurricula(currentPage + 1, searchTerm)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CurriculumManagement;