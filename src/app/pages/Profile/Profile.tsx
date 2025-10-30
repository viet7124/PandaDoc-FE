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
    <div className="space-y-8 w-11/12 max-w-[1400px] mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Profile</h1>
        <div className="mt-2 h-1.5 w-24 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 shadow-sm"></div>
        <p className="mt-3 text-gray-600 text-base">Manage your personal information</p>
      </div>
      <div className="bg-gradient-to-r from-black via-zinc-900 to-neutral-800 shadow-lg rounded-2xl p-9 mx-auto mb-10 relative w-full max-w-[1400px] flex flex-col md:flex-row items-center gap-8">
        <div className="relative mb-6 md:mb-0">
          <div className="w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden">
            {avatarPreview || getAvatarUrl(userProfile.avatar)
              ? <img src={avatarPreview || getAvatarUrl(userProfile.avatar)} alt="Profile" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">{userProfile.username?.[0]?.toUpperCase()||'U'}</div>
            }
          </div>
          {isEditing && (
            <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-white text-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-200 cursor-pointer transition">
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </label>
          )}
        </div>
        <div className="flex-1 text-white ">
          <h2 className="text-4xl font-black mb-1 drop-shadow">{userProfile.name || userProfile.username || 'User'}</h2>
          <div className="text-xl font-mono drop-shadow">@{userProfile.username}</div>
          <div className="font-light text-lg opacity-80 mb-3 drop-shadow">{userProfile.email}</div>
          <button onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))} className="mt-3 px-6 py-2 bg-white text-green-600 font-bold rounded-xl shadow hover:bg-gray-50 transition flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-50 overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Personal Information</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-600 uppercase">Username</label>
              {isEditing ? (
                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Enter your full name" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-lg" />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-lg">{userProfile.username}</div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-600 uppercase">Email</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-lg">{userProfile.email}</div>
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
              <button onClick={handleCancelEdit} disabled={isUpdatingProfile} className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveProfile} disabled={isUpdatingProfile || !editedName.trim()} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold">
                {isUpdatingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
