import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { getCurrentUser, updateProfile, getAvatarUrl, type UserProfile as UserProfileType } from './services/authAPI';

export default function Profile() {
  const toast = useToast();

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
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
    fetchUserProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid File Type', 'Please upload .jpg or .png');
      return;
    }
    const max = 2 * 1024 * 1024;
    if (file.size > max) {
      toast.error('File Too Large', 'Avatar must be under 2MB');
      return;
    }
    setSelectedAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      toast.warning('Name Required', 'Please enter a name');
      return;
    }
    try {
      setIsUpdatingProfile(true);
      await updateProfile(editedName, selectedAvatar || undefined);
      const refreshed = await getCurrentUser();
      setUserProfile(refreshed);
      setEditedName(refreshed.name || refreshed.username);
      setIsEditing(false);
      setSelectedAvatar(null);
      setAvatarPreview(null);
      toast.success('Profile Updated', 'Your profile has been updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Update Failed', 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setEditedName(userProfile?.name || userProfile?.username || '');
  };

  // Render
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
    <div className="space-y-8 max-w-3xl mx-auto p-8">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                {(avatarPreview || getAvatarUrl(userProfile.avatar)) ? (
                  <img src={avatarPreview || getAvatarUrl(userProfile.avatar)} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {(userProfile.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">{userProfile.name || userProfile.username || 'User'}</h2>
                <p className="text-white text-opacity-90 font-medium">@{userProfile.username || 'user'}</p>
                <p className="text-white text-opacity-80 text-sm">{userProfile.email}</p>
              </div>
            </div>
          </div>
          <button onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))} className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-semibold shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700"> Username</label>
              {isEditing ? (
                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Enter your full name" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{userProfile.username}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 font-medium">{userProfile.email}</p>
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
              <button onClick={handleCancelEdit} disabled={isUpdatingProfile} className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveProfile} disabled={isUpdatingProfile || !editedName.trim()} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdatingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
