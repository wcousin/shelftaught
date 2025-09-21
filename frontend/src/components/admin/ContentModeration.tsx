import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface ModerationItem {
  id: string;
  type: 'review' | 'comment' | 'user_note';
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  curriculum?: {
    id: string;
    name: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reportCount: number;
  reports: Array<{
    id: string;
    reason: string;
    reportedBy: string;
    reportedAt: string;
  }>;
}

const ContentModeration: React.FC = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported'>('pending');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);

  useEffect(() => {
    fetchModerationItems();
  }, [filter]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      // Note: This endpoint would need to be implemented in the backend
      // For now, we'll show a placeholder interface
      setError('Content moderation endpoint not yet implemented');
      setItems([]);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch moderation items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      await api.put(`/admin/moderation/${itemId}`, { status: 'approved' });
      await fetchModerationItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to approve item');
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      await api.put(`/admin/moderation/${itemId}`, { status: 'rejected' });
      await fetchModerationItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reject item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/moderation/${itemId}`);
      await fetchModerationItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete item');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      review: 'bg-blue-100 text-blue-800',
      comment: 'bg-purple-100 text-purple-800',
      user_note: 'bg-gray-100 text-gray-800'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'reported')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Content</option>
            <option value="pending">Pending Review</option>
            <option value="reported">Reported Content</option>
          </select>
        </div>
      </div>

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
        <div className="bg-white shadow rounded-lg">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="mb-4">
                  <span className="text-4xl">🛡️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content Moderation</h3>
                <p className="text-gray-500 mb-4">
                  {error ? 
                    'Content moderation features are not yet implemented.' :
                    'No content requires moderation at this time.'
                  }
                </p>
                {error && (
                  <div className="max-w-md mx-auto text-left">
                    <p className="text-sm text-gray-600 mb-2">This section would typically include:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Review user-generated content and comments</li>
                      <li>• Handle reported content and user complaints</li>
                      <li>• Approve or reject curriculum reviews</li>
                      <li>• Moderate user notes and personal reviews</li>
                      <li>• Track content quality and community guidelines</li>
                      <li>• Manage user warnings and account restrictions</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                          {item.type.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                        {item.reportCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.reportCount} reports
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-900 line-clamp-3">{item.content}</p>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>By: {item.author.name}</span>
                        {item.curriculum && (
                          <span>Curriculum: {item.curriculum.name}</span>
                        )}
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {item.reports.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <p className="text-sm font-medium text-red-800 mb-1">Reports:</p>
                          {item.reports.slice(0, 2).map((report) => (
                            <p key={report.id} className="text-sm text-red-700">
                              • {report.reason} (reported {new Date(report.reportedAt).toLocaleDateString()})
                            </p>
                          ))}
                          {item.reports.length > 2 && (
                            <p className="text-sm text-red-600">
                              +{item.reports.length - 2} more reports
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Content Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Content:</p>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedItem.content}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Author:</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedItem.author.name} ({selectedItem.author.email})
                  </p>
                </div>
                
                {selectedItem.curriculum && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Related Curriculum:</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.curriculum.name}</p>
                  </div>
                )}
                
                {selectedItem.reports.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">All Reports:</p>
                    <div className="mt-1 space-y-2">
                      {selectedItem.reports.map((report) => (
                        <div key={report.id} className="p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-900">{report.reason}</p>
                          <p className="text-xs text-gray-500">
                            Reported by {report.reportedBy} on {new Date(report.reportedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedItem.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;