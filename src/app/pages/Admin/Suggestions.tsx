import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { getSuggestions, respondToSuggestion } from './services/suggestionsAPI';
import type { Suggestion } from './services/suggestionsAPI';

export default function Suggestions() {
  const toast = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionStatus, setActionStatus] = useState<'REVIEWED' | 'RESOLVED' | 'REJECTED' | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Error Loading Suggestions', 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (status: 'REVIEWED' | 'RESOLVED' | 'REJECTED') => {
    if (!selectedSuggestion) return;

    setActionStatus(status);
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedSuggestion || !actionStatus) return;

    try {
      const updated = await respondToSuggestion(
        selectedSuggestion.id,
        actionStatus,
        responseText.trim() || undefined
      );

      // Update local state
      setSuggestions(prev =>
        prev.map(s => s.id === updated.id ? updated : s)
      );
      setSelectedSuggestion(updated);

      setShowResponseModal(false);
      setResponseText('');
      setActionStatus(null);
      toast.success('Suggestion Updated', `Suggestion marked as ${actionStatus.toLowerCase()}!`);
    } catch (error) {
      console.error('Error responding to suggestion:', error);
      toast.error('Update Failed', 'Failed to update suggestion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'RESPONDED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 ml-10 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggestions</h1>
        <p className="text-gray-600">Review and respond to user suggestions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Suggestions</h3>
          <p className="text-3xl font-bold text-gray-900">{suggestions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {suggestions.filter(s => s.status.toUpperCase() === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Reviewed</h3>
          <p className="text-3xl font-bold text-blue-600">
            {suggestions.filter(s => s.status.toUpperCase() === 'REVIEWED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Responded</h3>
          <p className="text-3xl font-bold text-green-600">
            {suggestions.filter(s => s.status.toUpperCase() === 'RESPONDED' || s.status.toUpperCase() === 'RESOLVED').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suggestions List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Suggestions List</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => setSelectedSuggestion(suggestion)}
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedSuggestion?.id === suggestion.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Suggestion #{suggestion.id}</h3>
                    <p className="text-sm text-gray-600">@{suggestion.username}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{suggestion.message}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(suggestion.status)}`}>
                    {suggestion.status}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">{formatDate(suggestion.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion Detail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedSuggestion ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Suggestion Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">#{selectedSuggestion.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-gray-900">@{selectedSuggestion.username}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedSuggestion.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedSuggestion.status)}`}>
                      {selectedSuggestion.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-900">{formatDate(selectedSuggestion.createdAt)}</p>
                </div>

                {selectedSuggestion.respondedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Responded At</label>
                    <p className="text-gray-900">{formatDate(selectedSuggestion.respondedAt)}</p>
                  </div>
                )}

                {selectedSuggestion.response && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Admin Response</label>
                    <p className="text-gray-900 mt-1 p-3 bg-blue-50 rounded-lg">{selectedSuggestion.response}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleRespond('REVIEWED')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleRespond('RESOLVED')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleRespond('REJECTED')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-gray-600">Select a suggestion to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionStatus === 'REVIEWED' && 'Mark as Reviewed'}
              {actionStatus === 'RESOLVED' && 'Mark as Resolved'}
              {actionStatus === 'REJECTED' && 'Reject Suggestion'}
            </h3>
            <p className="text-gray-600 mb-4">
              Add an optional response message for the user:
            </p>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Enter your response (optional)..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                  setActionStatus(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  actionStatus === 'RESOLVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionStatus === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
