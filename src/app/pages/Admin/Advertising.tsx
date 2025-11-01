import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { type Campaign } from './services/advertisingAPI';

export default function Advertising() {
  const toast = useToast();
  const [campaigns] = useState<Campaign[]>([]); // Backend not implemented yet
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Campaign>({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    targetAudience: [],
    budget: 0
  });

  const [targetAudienceInput, setTargetAudienceInput] = useState('');

  // Backend not implemented yet
  // useEffect(() => {
  //   fetchCampaigns();
  // }, []);

  // const fetchCampaigns = async () => {
  //   try {
  //     const data = await getAllCampaigns();
  //     setCampaigns(data);
  //   } catch (error) {
  //     console.error('Error fetching campaigns:', error);
  //   }
  // };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.startDate || !formData.endDate) {
      toast.warning('Missing Fields', 'Please fill in all required fields');
      return;
    }

    // Backend not implemented yet
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      toast.info('Feature In Development', 'Campaign creation is currently in development. Backend API not available yet.');
    }, 500);

    // try {
    //   setIsSubmitting(true);
    //   const response = await createCampaign(formData);
    //   
    //   if (response.success) {
    //     toast.success('Campaign Created', 'Campaign created successfully!');
    //     setShowCreateModal(false);
    //     setFormData({
    //       title: '',
    //       content: '',
    //       startDate: '',
    //       endDate: '',
    //       targetAudience: [],
    //       budget: 0
    //     });
    //     setTargetAudienceInput('');
    //     fetchCampaigns();
    //   }
    // } catch (error) {
    //   console.error('Error creating campaign:', error);
    //   toast.error('Creation Failed', 'Failed to create campaign');
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const addTargetAudience = () => {
    if (targetAudienceInput.trim()) {
      setFormData({
        ...formData,
        targetAudience: [...formData.targetAudience, targetAudienceInput.trim()]
      });
      setTargetAudienceInput('');
    }
  };

  const removeTargetAudience = (index: number) => {
    setFormData({
      ...formData,
      targetAudience: formData.targetAudience.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-6 ml-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertising Management</h1>
            <p className="text-gray-600">Set up and manage ads displayed on the website</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
          >
            + Create New Campaign
          </button>
        </div>
      </div>

      {/* No Data Message */}
      {campaigns.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg 
              className="w-24 h-24 text-gray-300 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-2 max-w-md">
              There are no advertising campaigns at the moment.
            </p>
            <p className="text-sm text-amber-600 font-medium mb-6">
              ⚠️ Feature in development - Backend API not yet implemented
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Campaign
            </button>
          </div>
        </div>
      )}

      {/* Campaigns Section */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.content}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-semibold text-gray-900">{campaign.budget.toLocaleString()} VND</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-700">{campaign.startDate} to {campaign.endDate}</span>
                  </div>
                  {campaign.targetAudience.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-xs">Target:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.targetAudience.map((audience, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Create New Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Summer Sale Campaign"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content/Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe your advertising campaign..."
                    required
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetAudienceInput}
                      onChange={(e) => setTargetAudienceInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetAudience())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Add target audience (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={addTargetAudience}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.targetAudience.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.targetAudience.map((audience, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {audience}
                          <button
                            type="button"
                            onClick={() => removeTargetAudience(index)}
                            className="hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Campaign'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
