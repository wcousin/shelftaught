import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Analytics {
  overview: {
    totalCurricula: number;
    totalUsers: number;
    totalSavedCurricula: number;
    totalSubjects: number;
    totalGradeLevels: number;
  };
  recentActivity: {
    newCurricula: number;
    newUsers: number;
    newSaves: number;
  };
  topPerforming: {
    topRatedCurricula: Array<{
      id: string;
      name: string;
      publisher: string;
      overallRating: number;
      reviewCount: number;
    }>;
    mostSavedCurricula: Array<{
      id: string;
      name: string;
      publisher: string;
      overallRating: number;
      saveCount: number;
    }>;
  };
  distribution: {
    byGradeLevel: Array<{
      id: string;
      name: string;
      ageRange: string;
      curriculumCount: number;
    }>;
    bySubject: Array<{
      id: string;
      name: string;
      curriculumCount: number;
    }>;
  };
  averageRatings: {
    overall: number;
    targetAgeGrade: number;
    teachingApproach: number;
    subjectsCovered: number;
    materialsIncluded: number;
    instructionStyle: number;
    timeCommitment: number;
    cost: number;
    availability: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      
      if (response.data.success) {
        setAnalytics(response.data.data.analytics);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Curricula</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalCurricula}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">💾</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Saved Curricula</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalSavedCurricula}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📖</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subjects</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalSubjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">🎓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Grade Levels</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalGradeLevels}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{analytics.recentActivity.newCurricula}</p>
            <p className="text-sm text-gray-500">New Curricula</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{analytics.recentActivity.newUsers}</p>
            <p className="text-sm text-gray-500">New Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{analytics.recentActivity.newSaves}</p>
            <p className="text-sm text-gray-500">New Saves</p>
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Rated Curricula</h3>
          <div className="space-y-3">
            {(analytics?.topPerforming?.topRatedCurricula || []).slice(0, 5).map((curriculum, index) => (
              <div key={curriculum.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{curriculum.name}</p>
                    <p className="text-xs text-gray-500">{curriculum.publisher}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{curriculum.overallRating.toFixed(1)}/5</p>
                  <p className="text-xs text-gray-500">{curriculum.reviewCount} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Saved Curricula</h3>
          <div className="space-y-3">
            {(analytics?.topPerforming?.mostSavedCurricula || []).slice(0, 5).map((curriculum, index) => (
              <div key={curriculum.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{curriculum.name}</p>
                    <p className="text-xs text-gray-500">{curriculum.publisher}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{curriculum.saveCount} saves</p>
                  <p className="text-xs text-gray-500">{curriculum.overallRating.toFixed(1)}/5 rating</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Curricula by Grade Level</h3>
          <div className="space-y-3">
            {(analytics?.distribution?.byGradeLevel || []).map((grade) => (
              <div key={grade.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{grade.name}</p>
                  <p className="text-xs text-gray-500">{grade.ageRange}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (grade.curriculumCount / Math.max(...analytics.distribution.byGradeLevel.map(g => g.curriculumCount))) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{grade.curriculumCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Curricula by Subject</h3>
          <div className="space-y-3">
            {(analytics?.distribution?.bySubject || []).slice(0, 8).map((subject) => (
              <div key={subject.id} className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (subject.curriculumCount / Math.max(...analytics.distribution.bySubject.map(s => s.curriculumCount))) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{subject.curriculumCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Ratings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Average Ratings Across All Curricula</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(analytics?.averageRatings || {}).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</p>
              <p className="text-sm text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(value / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;