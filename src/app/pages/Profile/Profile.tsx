import React, { useState } from 'react';
import { Link } from 'react-router-dom';
interface Template {
  id: string;
  title: string;
  image: string;
  downloadCount: string;
  buyDate: string;
  category: string;
}

interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Professional Business Report',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    downloadCount: '1.7k times',
    buyDate: '30 Jun 2025',
    category: 'Reports'
  },
  {
    id: '2',
    title: 'Annual Financial Report',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
    downloadCount: '2.1k times',
    buyDate: '25 Jun 2025',
    category: 'Reports'
  },
  {
    id: '3',
    title: 'Professional Business Presentation',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop',
    downloadCount: '1.3k times',
    buyDate: '20 Jun 2025',
    category: 'Presentations'
  },
  {
    id: '4',
    title: 'Medical Company Report',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop',
    downloadCount: '890 times',
    buyDate: '15 Jun 2025',
    category: 'Reports'
  },
  {
    id: '5',
    title: 'Business Strategy Template',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    downloadCount: '1.5k times',
    buyDate: '10 Jun 2025',
    category: 'Presentations'
  },
  {
    id: '6',
    title: 'Corporate Proposal Template',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    downloadCount: '967 times',
    buyDate: '05 Jun 2025',
    category: 'Proposals'
  },
  {
    id: '7',
    title: 'Marketing Presentation',
    image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=300&h=200&fit=crop',
    downloadCount: '1.2k times',
    buyDate: '01 Jun 2025',
    category: 'Presentations'
  },
  {
    id: '8',
    title: 'Project Proposal Template',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    downloadCount: '743 times',
    buyDate: '28 May 2025',
    category: 'Proposals'
  }
];

const mockUserProfile: UserProfile = {
  name: 'Nerdgang',
  username: 'Nerd0703',
  email: 'nerdgang123@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'account' | 'purchased' | 'collections'>('account');
  const [activeCategory, setActiveCategory] = useState<'Reports' | 'Presentations' | 'Proposals'>('Reports');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const filteredTemplates = mockTemplates.filter(template => template.category === activeCategory);

  const TabButton = ({ 
    tab, 
    label, 
    icon 
  }: { 
    tab: 'account' | 'purchased' | 'collections'; 
    label: string; 
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-green-500 text-white shadow-md'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const CategoryButton = ({ 
    category, 
    label 
  }: { 
    category: 'Reports' | 'Presentations' | 'Proposals'; 
    label: string;
  }) => (
    <button
      onClick={() => setActiveCategory(category)}
      className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
        activeCategory === category
          ? 'bg-black text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const PaginationButton = ({ 
    page, 
    isActive, 
    onClick 
  }: { 
    page: number | string; 
    isActive?: boolean; 
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-green-500 text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {page}
    </button>
  );

  const renderAccountTab = () => (
    <div className="space-y-8">
      {/* Profile Header with Background */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                <img
                  src={mockUserProfile.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">{mockUserProfile.name}</h2>
                <p className="text-white text-opacity-90 font-medium">@{mockUserProfile.username}</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white bg-opacity-20 text-black font-medium rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm border border-white border-opacity-20">
                  Change Profile
                </button>
                <button className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-md">
                  Account & Privacy
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-semibold shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">12</h3>
              <p className="text-gray-700 font-medium">Templates Purchased</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">8</h3>
              <p className="text-gray-700 font-medium">Favorite Collections</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">47</h3>
              <p className="text-gray-700 font-medium">Total Downloads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={mockUserProfile.name}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{mockUserProfile.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  defaultValue={mockUserProfile.email}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{mockUserProfile.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">User Name</label>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={mockUserProfile.username}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{mockUserProfile.username}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  defaultValue="Professional template designer and business consultant with 5+ years of experience."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">Professional template designer and business consultant with 5+ years of experience.</p>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'Downloaded', item: 'Professional Business Report', time: '2 hours ago', icon: '📊' },
            { action: 'Purchased', item: 'Annual Financial Report', time: '1 day ago', icon: '🛒' },
            { action: 'Added to favorites', item: 'Business Strategy Template', time: '3 days ago', icon: '❤️' },
            { action: 'Downloaded', item: 'Marketing Presentation', time: '1 week ago', icon: '📈' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-medium">{activity.action}</span> {activity.item}
                </p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTemplateGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map((template) => (
        <div key={template.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group">
          <div className="relative">
            <img
              src={template.image}
              alt={template.title}
              className="w-full h-48 object-cover"
            />
            <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-sm text-gray-600">Downloaded {template.downloadCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{template.buyDate}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Download
              </button>
              <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button className="w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <PaginationButton page={1} isActive={currentPage === 1} onClick={() => setCurrentPage(1)} />
      <PaginationButton page={2} isActive={currentPage === 2} onClick={() => setCurrentPage(2)} />
      <PaginationButton page={3} isActive={currentPage === 3} onClick={() => setCurrentPage(3)} />
      <span className="px-2 text-gray-500">...</span>
      <PaginationButton page={10} isActive={currentPage === 10} onClick={() => setCurrentPage(10)} />
      
      <button className="w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/">
        <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors bg-white rounded-lg px-6 py-3 shadow-md hover:shadow-lg font-medium border border-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        </Link>
        {/* Profile Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">My Profile</h1>
              <p className="text-lg text-gray-700 font-medium">Manage your account settings and preferences</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Account Verified</p>
                    <p className="text-sm text-green-600 font-medium">Premium Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white p-2 rounded-xl mb-10 inline-flex shadow-sm border border-gray-100">
          <TabButton
            tab="account"
            label="Account"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <TabButton
            tab="purchased"
            label="Templates Purchased"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          <TabButton
            tab="collections"
            label="My collections"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && renderAccountTab()}

        {(activeTab === 'purchased' || activeTab === 'collections') && (
          <div className="space-y-8">
            {/* Header for Templates */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'purchased' ? 'My Templates' : 'My Collections'}
                  </h2>
                  <p className="text-gray-700 mt-2 font-medium">
                    {activeTab === 'purchased' 
                      ? 'Templates you have purchased and downloaded' 
                      : 'Your favorite template collections'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {filteredTemplates.length} {activeCategory.toLowerCase()}
                  </span>
                </div>
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-3">
                <CategoryButton category="Reports" label="Reports" />
                <CategoryButton category="Presentations" label="Presentations" />
                <CategoryButton category="Proposals" label="Proposals" />
              </div>
            </div>

            {/* Templates Grid */}
            {renderTemplateGrid()}

            {/* Pagination */}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}
