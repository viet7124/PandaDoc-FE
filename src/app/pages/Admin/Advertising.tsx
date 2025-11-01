import { useState } from 'react';
import { type Campaign } from './services/advertisingAPI';

export default function Advertising() {
  const [campaigns] = useState<Campaign[]>([]); // Backend not implemented yet

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

  return (
    <div className="p-6 ml-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertising Management</h1>
          <p className="text-gray-600">Set up and manage ads displayed on the website</p>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Advertisements Yet</h3>
            <p className="text-gray-500 max-w-md">
              There are no advertisements available at the moment.
            </p>
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
      </div>
    </div>
  );
}
