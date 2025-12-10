import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Upload, 
  Edit, 
  Star,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import { 
  getSellerDashboard, 
  uploadTemplate, 
  getCategories,
  getSellerTemplates,
  getSellerPayouts,
  getEarningsSummary,
  getSellerProfile,
  updateSellerProfile,
  type SellerDashboard,
  type Category,
  type UploadTemplateRequest,
  type SellerPayout,
  type EarningsSummary,
  type SellerProfile,
  type UpdateSellerProfileData,
  type SellerTemplate
} from './services/sellerAPI';
import { useToast } from '../../contexts/ToastContext';
import { validateTemplateFile } from '../../utils/fileValidation';


export default function SellerProfile() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'templates' | 'earnings' | 'profile'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [, setDashboardData] = useState<SellerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Templates state
  const [templates, setTemplates] = useState<SellerTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  // delete functionality removed

  // Upload template state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadForm, setUploadForm] = useState<UploadTemplateRequest>({
    file: null,
    title: '',
    description: '',
    price: '',
    categoryId: '',
    isPremium: false
  });
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Earnings and payouts state
  const [payouts, setPayouts] = useState<SellerPayout[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Profile management state
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState<UpdateSellerProfileData>({
    businessName: '',
    description: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolderName: ''
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Common Vietnamese banks for selection
  const BANK_OPTIONS: string[] = [
    'Vietcombank',
    'Techcombank',
    'BIDV',
    'VietinBank',
    'Agribank',
    'MB Bank',
    'ACB',
    'TPBank',
    'Sacombank',
    'VPBank',
    'HDBank',
    'VIB',
    'OCB',
    'SHB',
    'SeaBank',
    'DongA Bank',
    'Eximbank'
  ];

  // Check if user has ROLE_SELLER and fetch dashboard data
  useEffect(() => {
    let userRoles: string[] = [];
    try {
      userRoles = JSON.parse(sessionStorage.getItem('userRoles') || localStorage.getItem('userRoles') || '[]');
    } catch {
      userRoles = [];
    }
    if (!userRoles.includes('ROLE_SELLER')) {
      navigate('/profile');
      return;
    }

    // Clear any cached profile data to ensure fresh data
    localStorage.removeItem('sellerProfile');

    // Fetch dashboard data and seller profile
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [dashboardData, profileData] = await Promise.all([
          getSellerDashboard(),
          getSellerProfile()
        ]);
        setDashboardData(dashboardData);
        setSellerProfile(profileData);
        // Ensure form is populated with existing data
        const formData = {
          businessName: profileData.businessName || '',
          description: profileData.description || '',
          bankName: profileData.bankName || '',
          bankAccountNumber: profileData.bankAccountNumber || '',
          bankAccountHolderName: profileData.bankAccountHolderName || ''
        };
        
        console.log('Initial profile form data:', formData);
        setProfileForm(formData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Fetch categories for upload form
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [navigate]);

  // Fetch templates when templates tab is active
  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'earnings') {
      fetchPayoutsData();
    } else if (activeTab === 'profile') {
      fetchSellerProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Update form when sellerProfile changes (but not when modal is open)
  useEffect(() => {
    if (sellerProfile && !showProfileModal) {
      const formData = {
        businessName: sellerProfile.businessName || '',
        description: sellerProfile.description || '',
        bankName: sellerProfile.bankName || '',
        bankAccountNumber: sellerProfile.bankAccountNumber || '',
        bankAccountHolderName: sellerProfile.bankAccountHolderName || ''
      };
      console.log('Updating form due to sellerProfile change:', formData);
      setProfileForm(formData);
    }
  }, [sellerProfile, showProfileModal]);

  // Fetch payouts data
  const fetchPayoutsData = async () => {
    try {
      setLoadingPayouts(true);
      const [payoutsData, summaryData] = await Promise.all([
        getSellerPayouts(),
        getEarningsSummary()
      ]);
      
      console.log('💰 Payouts data received in component:', payoutsData);
      console.log('💰 Earnings summary received in component:', summaryData);
      
      // Check for zero amounts and log warnings
      payoutsData.forEach((payout) => {
        if (payout.amount === 0) {
          console.warn(`⚠️ Payout ${payout.id} has zero amount:`, payout);
        }
        if (payout.templatesSold === 0) {
          console.warn(`⚠️ Payout ${payout.id} has zero templates sold:`, payout);
        }
      });
      
      setPayouts(payoutsData);
      setEarningsSummary(summaryData);
    } catch (error) {
      console.error('Error fetching payouts data:', error);
      toast.error('Error', 'Failed to load earnings data');
    } finally {
      setLoadingPayouts(false);
    }
  };

  // Fetch seller templates
  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await getSellerTemplates();
      console.log('✅ Fetched seller templates:', data);
      
      // Additional safety check: ensure category is always a string
      const safeTemplates = data.map(template => {
        // If category is still an object, convert it to string
        let safeCategory: string;
        if (typeof template.category === 'object' && template.category !== null) {
          safeCategory = (template.category as { name: string }).name || 'Uncategorized';
        } else if (typeof template.category === 'string') {
          safeCategory = template.category;
        } else {
          safeCategory = 'Uncategorized';
        }
        
        return {
          ...template,
          category: safeCategory
        };
      });
      
      setTemplates(safeTemplates);
    } catch (error) {
      console.error('❌ Error fetching seller templates:', error);
      toast.error('Error', 'Failed to load templates');
      setTemplates([]); // Set empty array on error
    } finally {
      setLoadingTemplates(false);
    }
  };


  // Delete handler removed

  // Profile management functions
  const fetchSellerProfile = async () => {
    try {
      // Clear any cached profile data to ensure fresh data
      localStorage.removeItem('sellerProfile');
      
      // Debug: Log current user info
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔍 Current user info:', user);
      console.log('🔍 User ID:', user.id);
      console.log('🔍 User roles:', JSON.parse(localStorage.getItem('userRoles') || '[]'));
      
      const profile = await getSellerProfile();
      console.log('📊 Fetched profile for form:', profile);
      
      setSellerProfile(profile);
      
      // Ensure form is populated with existing data
      const formData = {
        businessName: profile.businessName || '',
        description: profile.description || '',
        bankName: profile.bankName || '',
        bankAccountNumber: profile.bankAccountNumber || '',
        bankAccountHolderName: profile.bankAccountHolderName || ''
      };
      
      console.log('📝 Setting profile form with data:', formData);
      setProfileForm(formData);
    } catch (error) {
      console.error('❌ Error fetching seller profile:', error);
      toast.error('Profile Error', 'Failed to load profile information');
    }
  };

  const handleProfileFormChange = (field: keyof UpdateSellerProfileData, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value || ''
    }));
    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Only validate fields that have been modified (not empty)
    // This allows partial updates without requiring all fields
    if (profileForm.businessName && !profileForm.businessName.trim()) {
      errors.businessName = 'Business name cannot be empty';
    }

    if (profileForm.description && !profileForm.description.trim()) {
      errors.description = 'Business description cannot be empty';
    }

    if (profileForm.bankName && !profileForm.bankName.trim()) {
      errors.bankName = 'Bank name cannot be empty';
    }

    if (profileForm.bankAccountNumber && !profileForm.bankAccountNumber.trim()) {
      errors.bankAccountNumber = 'Bank account number cannot be empty';
    }

    if (profileForm.bankAccountHolderName && !profileForm.bankAccountHolderName.trim()) {
      errors.bankAccountHolderName = 'Bank account holder name cannot be empty';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      setIsUpdatingProfile(true);
      
      // Build update data by comparing form values with current profile
      // Only include fields that have been modified (not empty and different from current)
      const updateData: UpdateSellerProfileData = {
        businessName: profileForm.businessName.trim() || sellerProfile?.businessName || '',
        description: profileForm.description.trim() || sellerProfile?.description || '',
        bankName: profileForm.bankName.trim() || sellerProfile?.bankName || '',
        bankAccountNumber: profileForm.bankAccountNumber.trim() || sellerProfile?.bankAccountNumber || '',
        bankAccountHolderName: profileForm.bankAccountHolderName.trim() || sellerProfile?.bankAccountHolderName || ''
      };
      
      console.log('Current profile data:', sellerProfile);
      console.log('Form data:', profileForm);
      console.log('Updating profile with data:', updateData);
      
      await updateSellerProfile(updateData);
      
      // Refresh profile data from server to ensure we have the latest data
      console.log('🔄 Refreshing profile data from server...');
      const refreshedProfile = await getSellerProfile();
      setSellerProfile(refreshedProfile);
      
      // Update the form with the refreshed data
      const formData = {
        businessName: refreshedProfile.businessName || '',
        description: refreshedProfile.description || '',
        bankName: refreshedProfile.bankName || '',
        bankAccountNumber: refreshedProfile.bankAccountNumber || '',
        bankAccountHolderName: refreshedProfile.bankAccountHolderName || ''
      };
      setProfileForm(formData);
      
      setShowProfileModal(false);
      toast.success('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Show specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          toast.error('Authentication Failed', 'Please login again to update your profile');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (error.message.includes('Access denied')) {
          toast.error('Access Denied', 'You may not have permission to update this profile');
        } else if (error.message.includes('Profile not found')) {
          toast.error('Profile Not Found', 'Your profile could not be found. Please try again.');
        } else if (error.message.includes('Bad Request')) {
          toast.error('Invalid Data', error.message);
        } else {
          toast.error('Update Failed', error.message || 'An error occurred while updating your profile');
        }
      } else {
        toast.error('Update Failed', 'An error occurred while updating your profile');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOpenProfileModal = () => {
    // Reset form to current profile data when opening modal
    if (sellerProfile) {
      const formData = {
        businessName: sellerProfile.businessName || '',
        description: sellerProfile.description || '',
        bankName: sellerProfile.bankName || '',
        bankAccountNumber: sellerProfile.bankAccountNumber || '',
        bankAccountHolderName: sellerProfile.bankAccountHolderName || ''
      };
      console.log('Current seller profile:', sellerProfile);
      console.log('Resetting form to current profile data:', formData);
      setProfileForm(formData);
    } else {
      console.log('No seller profile data available');
    }
    setShowProfileModal(true);
    setProfileErrors({});
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setProfileErrors({});
  };



  const filteredTemplates = Array.isArray(templates) ? templates.filter(template => {
    if (!template || typeof template !== 'object' || Object.keys(template).length === 0) {
      return false;
    }
    const templateName = template?.name || '';
    const rawStatus = (template?.status || '').toString().toLowerCase();
    
    // Map backend uppercase statuses (PENDING_REVIEW, APPROVED, PUBLISHED, REJECTED) to filter values
    let mappedStatus: string;
    if (rawStatus === 'pending_review' || rawStatus === 'pending') {
      mappedStatus = 'pending';
    } else if (rawStatus === 'approved' || rawStatus === 'published' || rawStatus === 'active') {
      mappedStatus = 'approved';
    } else if (rawStatus === 'rejected') {
      mappedStatus = 'rejected';
    } else {
      // Default to pending for unknown statuses
      mappedStatus = 'pending';
    }
    
    const matchesSearch = templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAllowed = ['pending', 'rejected', 'approved'].includes(mappedStatus);
    const matchesFilter = filterStatus === 'all' || mappedStatus === filterStatus;
    return matchesSearch && matchesAllowed && matchesFilter;
  }) : [];


  // Upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateTemplateFile(file);
      if (!validation.valid) {
        toast.error('Invalid File', validation.error || 'Please select a valid template file');
        e.target.value = '';
        return;
      }

      setUploadForm({ ...uploadForm, file });
      setUploadErrors({ ...uploadErrors, file: '' });
    }
  };

  const handleUploadFormChange = (field: keyof UploadTemplateRequest, value: string | boolean) => {
    // When price changes, force isPremium according to the rule and disable toggle
    if (field === 'price') {
      const numeric = Number(value || 0);
      const enforcedPremium = numeric > 0;
      setUploadForm({ ...uploadForm, price: String(value), isPremium: enforcedPremium });
      setUploadErrors({ ...uploadErrors, price: '' });
      return;
    }
    // If user tries to toggle isPremium manually, ignore when price enforces value
    if (field === 'isPremium') {
      const numeric = Number(uploadForm.price || 0);
      const enforcedPremium = numeric > 0;
      setUploadForm({ ...uploadForm, isPremium: enforcedPremium });
      return;
    }
    setUploadForm({ ...uploadForm, [field]: value } as UploadTemplateRequest);
    setUploadErrors({ ...uploadErrors, [field as string]: '' });
  };

  const validateUploadForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!uploadForm.file) {
      errors.file = 'Please select a template file';
    }
    if (!uploadForm.title.trim()) {
      errors.title = 'Template title is required';
    }
    if (!uploadForm.description.trim()) {
      errors.description = 'Template description is required';
    }
    if (!uploadForm.price || parseFloat(uploadForm.price) < 0) {
      errors.price = 'Please enter a valid price';
    }
    if (!uploadForm.categoryId) {
      errors.categoryId = 'Please select a category';
    }

    setUploadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUploadForm()) {
      toast.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Check if seller has bank info before allowing upload
    if (!sellerProfile?.hasBankInfo) {
      toast.error('Bank Information Required', 'Please complete your bank information in the Profile tab before uploading templates.');
      setShowUploadModal(false);
      setActiveTab('profile');
      return;
    }

    try {
      setIsUploading(true);
      await uploadTemplate(uploadForm);
      toast.success('Upload Successful', 'Your template has been uploaded and is pending review');
      
      // Reset form and close modal
      setUploadForm({
        file: null,
        title: '',
        description: '',
        price: '',
        categoryId: '',
        isPremium: false
      });
      setShowUploadModal(false);
      
      // Refresh dashboard data and templates
      const data = await getSellerDashboard();
      setDashboardData(data);
      await fetchTemplates(); // Refresh templates list
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('Upload Failed', 'Failed to upload template. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadForm({
      file: null,
      title: '',
      description: '',
      price: '',
      categoryId: '',
      isPremium: false
    });
    setUploadErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your templates and track your performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Templates
          </button>
          {/* Earnings tab removed */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
        </div>


        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New Template
                  </button>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            {loadingTemplates ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 text-lg">Loading templates...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                  // Skip rendering if template is empty or missing required properties
                  if (!template || !template.id) {
                    return null;
                  }
                  
                  return (
                <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default image if thumbnail fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Default fallback image */}
                    <div className={`absolute inset-0 flex items-center justify-center ${template.thumbnail ? 'hidden' : ''}`}>
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm font-medium text-gray-500">No Preview</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      {(() => {
                        const rawStatus = (template.status || '').toString().toLowerCase();
                        // Map backend statuses to display values
                        let mappedStatus: string;
                        let displayLabel: string;
                        if (rawStatus === 'pending_review' || rawStatus === 'pending') {
                          mappedStatus = 'pending';
                          displayLabel = 'PENDING';
                        } else if (rawStatus === 'approved' || rawStatus === 'published' || rawStatus === 'active') {
                          mappedStatus = 'approved';
                          displayLabel = 'APPROVED';
                        } else if (rawStatus === 'rejected') {
                          mappedStatus = 'rejected';
                          displayLabel = 'REJECTED';
                        } else {
                          mappedStatus = rawStatus;
                          displayLabel = rawStatus.toUpperCase();
                        }
                        const badgeClass = mappedStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : mappedStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700';
                        return (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                            {displayLabel}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{template.name || 'Untitled Template'}</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {typeof template.category === 'string' ? template.category : 'Uncategorized'}
                    </p>

                    {/* Removed Sales | Views | Rating and Earned */}
                    <div className="flex items-center justify-between mb-2">
                      {template.price === 0 ? (
                        <span className="text-2xl font-bold text-green-600">Free</span>
                      ) : (
                        <span className="text-2xl font-bold text-green-600">{(template.price || 0).toLocaleString('vi-VN')} VND</span>
                      )}
                    </div>

                    {/* Delete button removed */}
                  </div>
                </div>
                  );
                })}
              </div>
            )}

            {!loadingTemplates && filteredTemplates.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No templates found</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {loadingPayouts ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 text-lg">Loading earnings data...</p>
              </div>
            ) : (
              <>
                {/* Earnings Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <p className="text-green-100 text-sm mb-2">Total Earnings</p>
                    <h3 className="text-4xl font-bold mb-1">
                      {(earningsSummary?.totalEarnings || 0).toLocaleString('vi-VN')} VND
                    </h3>
                    <p className="text-green-100 text-sm">All time</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <p className="text-gray-600 text-sm mb-2">Pending Earnings</p>
                    <h3 className="text-3xl font-bold text-yellow-600 mb-1">
                      {(earningsSummary?.pendingEarnings || 0).toLocaleString('vi-VN')} VND
                    </h3>
                    <p className="text-gray-500 text-sm">Awaiting payout</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <p className="text-gray-600 text-sm mb-2">Paid Out</p>
                    <h3 className="text-3xl font-bold text-green-600 mb-1">
                      {(earningsSummary?.paidEarnings || 0).toLocaleString('vi-VN')} VND
                </h3>
                    <p className="text-gray-500 text-sm">Received</p>
            </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <p className="text-gray-600 text-sm mb-2">Total Payouts</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {earningsSummary?.totalPayouts || 0}
                    </h3>
                    <p className="text-gray-500 text-sm">Transactions</p>
                      </div>
                    </div>

                {/* Payout History */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Payout History</h3>
                    <p className="text-gray-600 mt-1">Track your payout transactions and status</p>
                    </div>

                  {loadingPayouts ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading payout history...</p>
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="text-center py-16">
                      <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl text-gray-500">No payouts yet</p>
                      <p className="text-gray-400 mt-2">Your payout history will appear here once templates are approved and sold</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Payout ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Templates Sold
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Created Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Paid Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payouts.map((payout) => (
                            <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  #{payout.id}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-bold text-lg ${
                                  (payout.amount || 0) === 0 ? 'text-gray-400' : 'text-green-600'
                                }`}>
                                  {(payout.amount || 0).toLocaleString('vi-VN')} VND
                                  {(payout.amount || 0) === 0 && (
                                    <span className="text-xs text-gray-500 ml-2">(No amount)</span>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <span className={payout.templatesSold === 0 ? 'text-gray-400' : ''}>
                                  {payout.templatesSold || 0} templates
                                  {payout.templatesSold === 0 && (
                                    <span className="text-xs text-gray-500 ml-1">(No sales)</span>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  payout.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                  payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {payout.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {payout.paidAt ? (
                                  new Date(payout.paidAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                                {payout.notes || <span className="text-gray-400">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
              </div>
                  )}
            </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-2">How Payouts Work:</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>Admin reviews and approves your templates</li>
                        <li>When templates are sold, earnings are tracked</li>
                        <li>Admin creates payout records with status "PENDING"</li>
                        <li>Admin processes payment manually via bank transfer</li>
                        <li>Once paid, status changes to "PAID" with the paid date</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}


        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Seller Profile</h3>
                  <p className="text-gray-600 mt-1">Manage your business information and bank details</p>
                </div>
                <button
                  onClick={handleOpenProfileModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              {sellerProfile ? (
                <div>
                  {/* Check if profile is empty */}
                  {(!sellerProfile.businessName && !sellerProfile.description && !sellerProfile.bankName) ? (
                    <div className="text-center py-8">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-center mb-4">
                          <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Profile Not Set Up</h3>
                        <p className="text-yellow-700 mb-4">You haven't set up your seller profile yet. Click "Edit Profile" to get started.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Business Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Business Information
                        </h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Business Name</label>
                          <p className="text-gray-900 font-medium">{sellerProfile.businessName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                          <p className="text-gray-900">{sellerProfile.description || 'Not provided'}</p>
                        </div>
                      </div>

                      {/* Bank Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Bank Information
                        </h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                          <p className="text-gray-900 font-medium">{sellerProfile.bankName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                          <p className="text-gray-900 font-medium">{sellerProfile.bankAccountNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Account Holder</label>
                          <p className="text-gray-900 font-medium">{sellerProfile.bankAccountHolderName || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading profile information...</p>
                </div>
              )}

              {/* Bank Info Status */}
              {sellerProfile && (
                <div className="mt-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {sellerProfile.hasBankInfo ? (
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${sellerProfile.hasBankInfo ? 'text-green-800' : 'text-yellow-800'}`}>
                        {sellerProfile.hasBankInfo ? 'Bank Information Complete' : 'Bank Information Required'}
                      </h3>
                      <div className={`mt-1 text-sm ${sellerProfile.hasBankInfo ? 'text-green-700' : 'text-yellow-700'}`}>
                        {sellerProfile.hasBankInfo ? (
                          <p>Your bank information is complete. You can upload templates and receive payouts.</p>
                        ) : (
                          <p>Please complete your bank information to upload templates and receive payouts.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload New Template</h2>
              <button
                onClick={closeUploadModal}
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadTemplate} className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template File <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="seller-template-file"
                    accept=".docx,.pdf,.pptx,.xlsx,.doc,.ppt,.xls"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="seller-template-file"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      uploadErrors.file ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-700">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        DOCX, PDF, PPTX, XLSX (MAX 50MB)
                      </p>
                      {uploadForm.file && (
                        <p className="mt-2 text-sm font-medium text-green-600">
                          ✓ {uploadForm.file.name}
                        </p>
                      )}
                    </div>
                  </label>
                  {uploadErrors.file && (
                    <p className="mt-1 text-sm text-red-600">{uploadErrors.file}</p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="seller-title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="seller-title"
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => handleUploadFormChange('title', e.target.value)}
                  disabled={isUploading}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    uploadErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter template title"
                />
                {uploadErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{uploadErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="seller-description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="seller-description"
                  rows={4}
                  value={uploadForm.description}
                  onChange={(e) => handleUploadFormChange('description', e.target.value)}
                  disabled={isUploading}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    uploadErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your template and its features"
                />
                {uploadErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{uploadErrors.description}</p>
                )}
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label htmlFor="seller-price" className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="seller-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={uploadForm.price}
                    onChange={(e) => handleUploadFormChange('price', e.target.value)}
                    disabled={isUploading}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      uploadErrors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {uploadErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{uploadErrors.price}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Set to 0 for free templates</p>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="seller-category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="seller-category"
                    value={uploadForm.categoryId}
                    onChange={(e) => handleUploadFormChange('categoryId', e.target.value)}
                    disabled={isUploading}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      uploadErrors.categoryId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {uploadErrors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{uploadErrors.categoryId}</p>
                  )}
                </div>
              </div>

              {/* Premium Toggle */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <input
                  id="seller-premium"
                  type="checkbox"
                  checked={uploadForm.isPremium}
                  onChange={(e) => handleUploadFormChange('isPremium', e.target.checked)}
                  disabled={isUploading || Number(uploadForm.price || 0) > 0 || Number(uploadForm.price || 0) === 0}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="seller-premium" className="flex items-center gap-2 cursor-pointer">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-gray-700">Mark as Premium Template</span>
                </label>
                <span className="ml-auto text-xs text-gray-500">Auto-set by price</span>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={isUploading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Template</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={handleCloseProfileModal}
                disabled={isUpdatingProfile}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="p-6 space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Business Information
                </h3>
                
                <div>
                  <label htmlFor="profile-businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    id="profile-businessName"
                    type="text"
                    value={profileForm.businessName || ''}
                    onChange={(e) => handleProfileFormChange('businessName', e.target.value)}
                    disabled={isUpdatingProfile}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      profileErrors.businessName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={sellerProfile?.businessName ? `Current: ${sellerProfile.businessName}` : "Enter your business name"}
                  />
                  {profileErrors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.businessName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    id="profile-description"
                    value={profileForm.description || ''}
                    onChange={(e) => handleProfileFormChange('description', e.target.value)}
                    disabled={isUpdatingProfile}
                    rows={4}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                      profileErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={sellerProfile?.description ? `Current: ${sellerProfile.description}` : "Describe your business and what kind of templates you create..."}
                  />
                  {profileErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.description}</p>
                  )}
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Bank Information
                </h3>
                <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <strong>Note:</strong> Leave fields empty to keep existing values. Complete bank information is required to upload templates and receive payouts.
                </p>
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <strong>Quan trọng:</strong> Vui lòng nhập chính xác thông tin tài khoản ngân hàng. Nếu sai, bạn có thể không nhận được tiền thanh toán.
                </p>
                
                <div>
                  <label htmlFor="profile-bankName" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <select
                    id="profile-bankName"
                    value={profileForm.bankName || ''}
                    onChange={(e) => handleProfileFormChange('bankName', e.target.value)}
                    disabled={isUpdatingProfile}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      profileErrors.bankName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your bank</option>
                    {BANK_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    {/* Allow custom bank name fallback */}
                    {profileForm.bankName && !BANK_OPTIONS.includes(profileForm.bankName) && (
                      <option value={profileForm.bankName}>{profileForm.bankName}</option>
                    )}
                  </select>
                  {profileErrors.bankName && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.bankName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account Number
                  </label>
                  <input
                    id="profile-bankAccountNumber"
                    type="text"
                    value={profileForm.bankAccountNumber || ''}
                    onChange={(e) => handleProfileFormChange('bankAccountNumber', e.target.value)}
                    disabled={isUpdatingProfile}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      profileErrors.bankAccountNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={sellerProfile?.bankAccountNumber ? `Current: ${sellerProfile.bankAccountNumber}` : "Enter your bank account number"}
                  />
                  {profileErrors.bankAccountNumber && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.bankAccountNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-bankAccountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    id="profile-bankAccountHolderName"
                    type="text"
                    value={profileForm.bankAccountHolderName || ''}
                    onChange={(e) => handleProfileFormChange('bankAccountHolderName', e.target.value)}
                    disabled={isUpdatingProfile}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      profileErrors.bankAccountHolderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={sellerProfile?.bankAccountHolderName ? `Current: ${sellerProfile.bankAccountHolderName}` : "Enter the name on the bank account"}
                  />
                  {profileErrors.bankAccountHolderName && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.bankAccountHolderName}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseProfileModal}
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}