import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { 
  getCollections, 
  createCollection, 
  updateCollection, 
  deleteCollection,
  removeTemplateFromCollection,
  type Collection 
} from './services/collectionsAPI';
import { 
  getPurchasedTemplates, 
  type PurchasedTemplate 
} from './services/purchasesAPI';
import { 
  getCurrentUser, 
  updateProfile,
  getAvatarUrl,
  type UserProfile as UserProfileType
} from './services/authAPI';
import { downloadTemplate } from '../TemplatePage/services/templateAPI';

export default function Profile() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'account' | 'purchased' | 'collections'>('account');
  const [selectedCategory, setSelectedCategory] = useState<number | 'REPORT' | 'OTHER' | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Purchased templates state
  const [purchasedTemplates, setPurchasedTemplates] = useState<PurchasedTemplate[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [downloadingTemplateId, setDownloadingTemplateId] = useState<number | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'collections') {
      fetchCollections();
    } else if (activeTab === 'purchased') {
      fetchPurchases();
    } else if (activeTab === 'account') {
      // Fetch both for account stats
      fetchCollections();
      fetchPurchases();
    }
  }, [activeTab]);

  // Refetch collections when page becomes visible (e.g., navigating back from template detail)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (activeTab === 'collections' || activeTab === 'account')) {
        fetchCollections();
      }
    };

    const handleFocus = () => {
      if (activeTab === 'collections' || activeTab === 'account') {
        fetchCollections();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await getCurrentUser();
      setUserProfile(data);
      setEditedName(data.name || data.username);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const data = await getCollections();
      console.log('Fetched collections:', data);
      console.log('Collections with templates:', data.map(c => ({
        id: c.id,
        name: c.name,
        templateCount: c.templateCount,
        templatesLength: c.templates?.length || 0,
        hasTemplates: !!c.templates
      })));
      
      // Normalize collections: convert null templates to empty arrays
      const normalizedCollections = data.map(collection => ({
        ...collection,
        templates: collection.templates || []
      }));
      
      setCollections(normalizedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoadingCollections(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const data = await getPurchasedTemplates();
      setPurchasedTemplates(data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      setIsCreating(true);
      const newCollection = await createCollection(newCollectionName, newCollectionDescription);
      
      // Ensure templates is an array, not null
      const normalizedCollection = {
        ...newCollection,
        templates: newCollection.templates || []
      };
      
      // Optimistically update UI
      setCollections(prev => [normalizedCollection, ...prev]);
      
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Creation Failed', 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection || !newCollectionName.trim()) return;
    
    try {
      setIsUpdating(true);
      const updatedCollection = await updateCollection(
        selectedCollection.id, 
        newCollectionName, 
        newCollectionDescription
      );
      
      // Update UI - preserve templates from current collection if API doesn't return them
      setCollections(prev => 
        prev.map(col => {
          if (col.id === updatedCollection.id) {
            return {
              ...updatedCollection,
              // Preserve templates if not returned from API (handle null/undefined)
              templates: updatedCollection.templates || col.templates || [],
              templateCount: updatedCollection.templateCount ?? col.templateCount
            };
          }
          return col;
        })
      );
      
      setShowEditModal(false);
      setSelectedCollection(null);
      setNewCollectionName('');
      setNewCollectionDescription('');
      toast.success('Collection Updated', 'Collection updated successfully!');
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Update Failed', 'Failed to update collection');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    const result = await confirm({
      title: 'Delete Collection',
      message: 'Are you sure you want to delete this collection? All templates will remain in your library.',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!result) return;
    
    try {
      setDeletingId(id);
      
      // Optimistically update UI
      setCollections(prev => prev.filter(col => col.id !== id));
      
      await deleteCollection(id);
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Deletion Failed', 'Failed to delete collection');
      // Revert on error
      fetchCollections();
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveTemplate = async (collectionId: number, templateId: number) => {
    const result = await confirm({
      title: 'Remove Template',
      message: 'Remove this template from the collection? The template will remain in your library.',
      type: 'warning',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    });

    if (!result) return;
    
    try {
      // Optimistically update UI
      setCollections(prev => 
        prev.map(col => {
          if (col.id === collectionId && col.templates) {
            return {
              ...col,
              templates: col.templates.filter(t => t.id !== templateId),
              templateCount: col.templateCount - 1
            };
          }
          return col;
        })
      );
      
      await removeTemplateFromCollection(collectionId, templateId);
    } catch (error) {
      console.error('Error removing template:', error);
      toast.error('Removal Failed', 'Failed to remove template');
      // Revert on error
      fetchCollections();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - Only .jpg and .png allowed for avatars
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid File Type', 'Please upload a valid image file (.jpg or .png only)');
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validate file size (max 2MB for avatars)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        toast.error('File Too Large', `Avatar image must be less than 2MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        e.target.value = ''; // Reset input
        return;
      }
      
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      toast.warning('Name Required', 'Please enter a name');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await updateProfile(editedName, selectedAvatar || undefined);
      
      // Refetch the complete user profile to ensure all fields are present
      await fetchUserProfile();
      
      // Update localStorage user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = editedName;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Reset edit mode
      setIsEditing(false);
      setSelectedAvatar(null);
      setAvatarPreview(null);
      
      toast.success('Profile Updated', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Update Failed', 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(userProfile?.name || userProfile?.username || '');
    setSelectedAvatar(null);
    setAvatarPreview(null);
  };

  const handleDownloadTemplate = async (templateId: number, templateTitle: string, documentType?: string) => {
    try {
      setDownloadingTemplateId(templateId);
      console.log('🔽 Downloading template:', templateId);
      
      const { blob, filename } = await downloadTemplate(templateId);
      
      // Use filename from server if available, otherwise fallback to templateTitle
      const downloadFilename = filename || `${templateTitle}.${documentType || 'file'}`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download Started', 'Your download will begin shortly');
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      toast.error('Download Failed', 'Failed to download template. Please try again.');
    } finally {
      setDownloadingTemplateId(null);
    }
  };

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

  const renderAccountTab = () => {
    if (loadingProfile) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (!userProfile) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600">Unable to load profile</p>
        </div>
      );
    }

    return (
    <div className="space-y-8">
      {/* Profile Header with Background */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                {(avatarPreview || getAvatarUrl(userProfile.avatar)) ? (
                <img
                    src={avatarPreview || getAvatarUrl(userProfile.avatar)}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    console.error('❌ Avatar image failed to load:', avatarPreview || getAvatarUrl(userProfile.avatar));
                    // Hide the broken image and show the fallback
                    e.currentTarget.style.display = 'none';
                  }}
                />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {(userProfile.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                </label>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                  {userProfile.name || userProfile.username || 'User'}
                </h2>
                <p className="text-white text-opacity-90 font-medium">@{userProfile.username || 'user'}</p>
                <p className="text-white text-opacity-80 text-sm">{userProfile.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.roles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-white text-green-600 text-xs font-bold rounded-full shadow-md"
                  >
                    {role.replace('ROLE_', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
            className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-semibold shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">{purchasedTemplates.length}</h3>
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
              <h3 className="text-3xl font-bold text-gray-900">{collections.length}</h3>
              <p className="text-gray-700 font-medium">Favorite Collections</p>
            </div>
          </div>
        </div>

        {/* Total Downloads card removed as requested */}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{userProfile.name || userProfile.username}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 font-medium">{userProfile.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">User Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 font-medium">@{userProfile.username || 'user'}</p>
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
            </div>


            {userProfile.phoneNumber && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{userProfile.phoneNumber}</p>
                </div>
                </div>
              )}

            {userProfile.address && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{userProfile.address}</p>
                </div>
            </div>
            )}

            {userProfile.bio && (
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{userProfile.bio}</p>
                </div>
                </div>
              )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
              <button 
                onClick={handleCancelEdit}
                disabled={isUpdatingProfile}
                className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile || !editedName.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdatingProfile ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {purchasedTemplates.slice(0, 4).map((purchase) => (
            <div key={purchase.libraryId} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-medium">Purchased</span> {purchase.template.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(purchase.acquiredAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <Link 
                to={`/templates/${purchase.template.id}`}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
          {purchasedTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">My Profile</h1>
              <p className="text-lg text-gray-700 font-medium">Manage your account settings and preferences</p>
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

        {activeTab === 'purchased' && (
          <div className="space-y-8">
            {/* Header for Templates */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Templates</h2>
                  <p className="text-gray-700 mt-2 font-medium">
                    Templates you have purchased and downloaded
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {purchasedTemplates.filter(p => {
                      if (selectedCategory === null) return true;
                      if (selectedCategory === 'REPORT') return p.template.category?.name?.toLowerCase() === 'report';
                      if (selectedCategory === 'OTHER') return p.template.category?.name?.toLowerCase() === 'other';
                      return p.template.category?.id === selectedCategory;
                    }).length} templates
                  </span>
                </div>
              </div>
              
              {/* Category Filters */}
              {!loadingPurchases && purchasedTemplates.length > 0 && (
              <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === null
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  <button
                    onClick={() => setSelectedCategory('REPORT')}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === 'REPORT'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Report
                  </button>
                  <button
                    onClick={() => setSelectedCategory('OTHER')}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === 'OTHER'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Other
                  </button>
                  {Array.from(new Set(purchasedTemplates.filter(p => p.template.category).map(p => p.template.category.id)))
                    .map(categoryId => {
                      const category = purchasedTemplates.find(p => p.template.category?.id === categoryId)?.template.category;
                      return category ? (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-black text-white'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {category.name}
                        </button>
                      ) : null;
                    })}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loadingPurchases && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loadingPurchases && purchasedTemplates.length === 0 && (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchased templates yet</h3>
                <p className="text-gray-600 mb-6">Browse our template marketplace to find your perfect template</p>
                <Link
                  to="/templates"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Templates
                </Link>
              </div>
            )}

            {/* Templates Grid */}
            {!loadingPurchases && purchasedTemplates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedTemplates
                  .filter(purchase => {
                    if (selectedCategory === null) return true;
                    if (selectedCategory === 'REPORT') return purchase.template.category?.name?.toLowerCase() === 'report';
                    if (selectedCategory === 'OTHER') return purchase.template.category?.name?.toLowerCase() === 'other';
                    return purchase.template.category?.id === selectedCategory;
                  })
                  .map((purchase) => (
                    <div key={purchase.libraryId} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group">
                      <div className="relative">
                        <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                          <svg className="w-20 h-20 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                            Purchased
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{purchase.template.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{purchase.template.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {purchase.template.category && (
                              <span className="px-2 py-1 bg-gray-100 rounded-full">{purchase.template.category.name}</span>
                            )}
                            <span>by {purchase.template.author?.username || 'Unknown'}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Acquired: {new Date(purchase.acquiredAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadTemplate(
                              purchase.template.id, 
                              purchase.template.title,
                              purchase.template.documentType
                            )}
                            disabled={downloadingTemplateId === purchase.template.id}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingTemplateId === purchase.template.id ? (
                              <>
                                <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </>
                            )}
                          </button>
                          <Link
                            to={`/templates/${purchase.template.id}`}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Collections</h2>
                  <p className="text-gray-700 mt-2">Organize your favorite templates into collections</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Collection
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loadingCollections && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            )}

            {/* Collections Grid */}
            {!loadingCollections && collections.length === 0 && (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No collections yet</h3>
                <p className="text-gray-600 mb-4">Create your first collection to organize templates</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Collection
                </button>
              </div>
            )}

            {!loadingCollections && collections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <div key={collection.id} className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{collection.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{collection.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedCollection(collection);
                              setNewCollectionName(collection.name);
                              setNewCollectionDescription(collection.description);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit collection"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(collection.id)}
                            disabled={deletingId === collection.id}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete collection"
                          >
                            {deletingId === collection.id ? (
                              <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {collection.templateCount} template{collection.templateCount !== 1 ? 's' : ''}
                      </div>

                      {/* Templates in Collection */}
                      {collection.templates && collection.templates.length > 0 ? (
                        <div className="space-y-3">
                          {collection.templates.slice(0, 3).map((template) => (
                            <Link
                              key={template.id}
                              to={`/template/${template.id}`}
                              className="block group"
                            >
                              <div className="flex items-start p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200">
                                {/* Template Icon/Thumbnail */}
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                  </svg>
                                </div>
                                
                                {/* Template Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                                    {template.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {template.category && (
                                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                        {template.category.name}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      by {template.author?.username || 'Unknown'}
                                    </span>
                                  </div>
                                  {template.price !== undefined && template.price !== null && (
                                    <p className="text-xs font-semibold text-gray-700 mt-1">
                                      {template.price === 0 ? (
                                        <span className="text-green-600">Free</span>
                                      ) : (
                                        `${template.price.toLocaleString('vi-VN')} VND`
                                      )}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Remove Button */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveTemplate(collection.id, template.id);
                                  }}
                                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Remove from collection"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </Link>
                          ))}
                          {collection.templates.length > 3 && (
                            <div className="text-center py-2 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-600">
                                +{collection.templates.length - 3} more template{collection.templates.length - 3 !== 1 ? 's' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : collection.templateCount > 0 ? (
                        <div className="text-center py-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-sm text-yellow-700 font-semibold mb-1">Backend Issue Detected</p>
                          <p className="text-xs text-yellow-600 mb-3">The API returns templateCount={collection.templateCount} but templates array is empty</p>
                          <button
                            onClick={() => fetchCollections()}
                            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry Fetch
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm text-gray-500 font-medium">No templates yet</p>
                          <p className="text-xs text-gray-400 mt-1">Add templates from template detail pages</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Collection Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Collection</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g., My Favorite Reports"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <textarea
                        value={newCollectionDescription}
                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                        placeholder="Describe this collection..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewCollectionName('');
                        setNewCollectionDescription('');
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCollection}
                      disabled={isCreating || !newCollectionName.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isCreating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Create'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Collection Modal */}
            {showEditModal && selectedCollection && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Collection</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={newCollectionDescription}
                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedCollection(null);
                        setNewCollectionName('');
                        setNewCollectionDescription('');
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateCollection}
                      disabled={isUpdating || !newCollectionName.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
