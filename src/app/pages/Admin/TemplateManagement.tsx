import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllTemplates, 
  rejectTemplate, 
  deleteTemplate,
  uploadTemplate,
  getCategories,
  downloadTemplate,
  updateTemplateStatus,
  updateTemplate
} from './services/templateManagementAPI';
import type { Template } from './services/templateManagementAPI';
import { uploadPreviewImages } from '../../pages/TemplatePage/services/templateAPI';
import { validatePreviewImages } from '../../utils/fileValidation';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { createTemplatePayout } from './services/payoutAPI';
import { trySendNotification } from '../Notification/services/notificationAPI';
import type { CreatePayoutRequest } from './services/payoutAPI';
import { getAuthState } from '../../utils/authUtils';

interface Category {
  id: number;
  name: string;
}

interface UploadFormData {
  file: File | null;
  title: string;
  description: string;
  price: string;
  categoryId: string;
  isPremium: boolean;
}

interface PayoutFormData {
  agreedPrice: number;
  adminNote: string;
}

type TemplateWithPreviews = Template & { previewImages?: string[] };

export default function TemplateManagement() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  
  // Check authentication on component mount
  useEffect(() => {
    const { token, roles } = getAuthState();
    if (!token) {
      console.log('🔒 No authentication token found, redirecting to login');
      toast.error('Authentication Required', 'Please login to access admin functions');
      navigate('/login');
      return;
    }
    
    // Check if user has admin role
    try {
      const hasAdminRole = roles && roles.includes('ROLE_ADMIN');
      if (!hasAdminRole) {
          console.log('🔒 User does not have ROLE_ADMIN, redirecting to login');
          toast.error('Access Denied', 'Admin privileges required');
          navigate('/login');
          return;
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
      navigate('/login');
      return;
    }
  }, [navigate, toast]);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [templates, setTemplates] = useState<TemplateWithPreviews[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    file: null,
    title: '',
    description: '',
    price: '',
    categoryId: '',
    isPremium: false
  });
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [downloadingTemplateId, setDownloadingTemplateId] = useState<number | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [selectedTemplateForPayout, setSelectedTemplateForPayout] = useState<TemplateWithPreviews | null>(null);
  const [payoutForm, setPayoutForm] = useState<PayoutFormData>({
    agreedPrice: 0,
    adminNote: ''
  });
  const [payoutErrors, setPayoutErrors] = useState<Record<string, string>>({});

  // Edit template state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<TemplateWithPreviews | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; price: string; fileUrl: string }>({
    title: '',
    description: '',
    price: '',
    fileUrl: ''
  });
  // JSON-only update; no multipart file upload supported for edit
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  // Preview images upload state
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPreviewFiles, setSelectedPreviewFiles] = useState<File[]>([]);
  const [isUploadingPreviews, setIsUploadingPreviews] = useState<boolean>(false);

  // Pagination logic:
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 12;
  const totalPages = Math.ceil(templates.length / templatesPerPage);
  const visibleTemplates = templates.slice(
    (currentPage - 1) * templatesPerPage,
    currentPage * templatesPerPage
  );

  // Fetch templates on mount and when status filter changes ok
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTemplates(statusFilter === 'ALL' ? undefined : statusFilter);
      // Note: Backend may not be returning status field consistently
      // Templates without status will show as "Needs Review" and can be approved
      console.log('Templates fetched:', response.content.map(t => ({ 
        id: t.id, 
        title: t.title, 
        status: t.status || 'NO_STATUS' 
      })));
      setTemplates(response.content);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [statusFilter]); // Remove fetchTemplates and fetchCategories from dependencies to prevent infinite loop

  const handleApprove = async (id: number) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    const result = await confirm({
      title: 'Approve Template',
      message: 'Are you sure you want to approve this template? This will change the status to APPROVED and you can create a payout from the payout management section.',
      type: 'success',
      confirmText: 'Approve',
      cancelText: 'Cancel'
    });

    if (!result) return;
    
    try {
      setIsProcessing(true);
      // Change status to APPROVED (not PUBLISHED yet)
      await updateTemplateStatus(id, 'APPROVED');
      await fetchTemplates();
      toast.success('Template Approved', 'Template has been approved. You can now create a payout from the payout management section.');
    } catch (error) {
      console.error('Error approving template:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && (
        error.message.includes('Authentication') || 
        error.message.includes('Session expired') ||
        error.message.includes('Invalid session')
      )) {
        toast.error('Session Expired', 'Please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error('Approval Failed', 'An error occurred while approving the template');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a function to manually update template status to PUBLISHED
  const handlePublish = async (id: number) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    const result = await confirm({
      title: 'Publish Template',
      message: 'Are you sure you want to publish this template? This will make it available to users.',
      type: 'success',
      confirmText: 'Publish',
      cancelText: 'Cancel'
    });

    if (!result) return;
    
    try {
      setIsProcessing(true);
      await updateTemplateStatus(id, 'PUBLISHED');
      await fetchTemplates();
      toast.success('Template Published', 'Template has been published and is now available to users.');
    } catch (error) {
      console.error('Error publishing template:', error);
      toast.error('Publish Failed', 'An error occurred while publishing the template');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: number) => {
    const result = await confirm({
      title: 'Reject Template',
      message: 'Are you sure you want to reject this template? It will be hidden from users.',
      type: 'warning',
      confirmText: 'Reject',
      cancelText: 'Cancel'
    });

    if (!result) return;
    
    try {
      setIsProcessing(true);
      await rejectTemplate(id);
      await fetchTemplates();
      toast.success('Template Rejected', 'Template has been rejected');
    } catch (error) {
      console.error('Error rejecting template:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && (
        error.message.includes('Authentication') || 
        error.message.includes('Session expired') ||
        error.message.includes('Invalid session')
      )) {
        toast.error('Session Expired', 'Please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error('Rejection Failed', 'An error occurred while rejecting the template');
      }
    } finally {
      setIsProcessing(false);
    }
  };


  const handlePayoutFormChange = (field: keyof PayoutFormData, value: string | number) => {
    setPayoutForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (payoutErrors[field]) {
      setPayoutErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePayoutForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!payoutForm.agreedPrice || payoutForm.agreedPrice <= 0) {
      errors.agreedPrice = 'Payout amount must be greater than 0';
    }

    if (payoutForm.agreedPrice > 10000000) {
      errors.agreedPrice = 'Payout amount cannot exceed 10,000,000 VND';
    }

    setPayoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPayout = async () => {
    if (!selectedTemplateForPayout) return;

    if (!validatePayoutForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create the payout first (this should also approve the template automatically)
      const payoutData: CreatePayoutRequest = {
        agreedPrice: payoutForm.agreedPrice,
        adminNote: payoutForm.adminNote.trim() || undefined
      };
      
      await createTemplatePayout(selectedTemplateForPayout.id, payoutData);
      
      // Refresh templates and close modal
      await fetchTemplates();
      setShowPayoutModal(false);
      setSelectedTemplateForPayout(null);
      setPayoutForm({ agreedPrice: 0, adminNote: '' });
      
      toast.success('Template Approved & Payout Created', 
        `Template approved and payout of ${payoutForm.agreedPrice.toLocaleString()} VND has been created for the seller.`);

      // Best-effort notification to seller
      if (selectedTemplateForPayout) {
        trySendNotification({
          username: (selectedTemplateForPayout as unknown as { sellerUsername: string }).sellerUsername, // may or may not be present depending on API
          title: 'Template Approved',
          message: `Your template "${selectedTemplateForPayout.title}" has been approved. Payout ${payoutForm.agreedPrice.toLocaleString()} VND created.`,
          type: 'SUCCESS',
          link: '/seller-profile?tab=earnings'
        });
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      toast.error('Payout Creation Failed', 'An error occurred while creating the payout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePayoutModal = () => {
    setShowPayoutModal(false);
    setSelectedTemplateForPayout(null);
    setPayoutForm({ agreedPrice: 0, adminNote: '' });
    setPayoutErrors({});
  };

  const handleDelete = async (id: number) => {
    const result = await confirm({
      title: 'Delete Template',
      message: 'Are you sure you want to delete this template? This action cannot be undone and all associated data will be permanently removed.',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!result) return;
    
    try {
      setIsProcessing(true);
      await deleteTemplate(id);
      await fetchTemplates();
      toast.success('Template Deleted', 'Template has been permanently deleted');
    } catch (error) {
      console.error('Error deleting template:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && (
        error.message.includes('Authentication') || 
        error.message.includes('Session expired') ||
        error.message.includes('Invalid session') ||
        error.message.includes('Server redirected')
      )) {
        toast.error('Authentication Issue', 'Your session may have expired. Please login again.');
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error('Deletion Failed', 'An error occurred while deleting the template');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (template: TemplateWithPreviews) => {
    try {
      setDownloadingTemplateId(template.id);
      console.log('🔽 Admin downloading template:', template.id);
      
      const { blob, filename } = await downloadTemplate(template.id);
      
      // Use filename from server (includes correct extension)
      const downloadFilename = filename || `${template.title}.file`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download Started', `Downloading ${template.title}`);
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      toast.error('Download Failed', 'Failed to download template. Please try again.');
    } finally {
      setDownloadingTemplateId(null);
    }
  };

  // Handle preview image upload
  const handleOpenPreviewModal = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setSelectedPreviewFiles([]);
    setShowPreviewModal(true);
  };

  const handlePreviewFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validation = validatePreviewImages(files);
    if (!validation.valid) {
      toast.error('Invalid Files', validation.error || 'Please check your files');
      e.target.value = ''; // Reset input
      return;
    }

    // Enforce maximum of 4 preview images
    const limited = files.slice(0, 4);
    if (files.length > 4) {
      toast.info('Limit Reached', 'Only the first 4 images were selected.');
    }

    setSelectedPreviewFiles(limited);
  };

  const handleUploadPreviews = async () => {
    if (!selectedTemplateId || selectedPreviewFiles.length === 0) return;

    try {
      setIsUploadingPreviews(true);
      await uploadPreviewImages(selectedTemplateId, selectedPreviewFiles);
      toast.success('Upload Successful', 'Preview images uploaded successfully!');
      setShowPreviewModal(false);
      setSelectedPreviewFiles([]);
      setSelectedTemplateId(null);
      await fetchTemplates(); // Refresh template list
    } catch (error) {
      console.error('Error uploading preview images:', error);
      
      if (error instanceof Error) {
        toast.error('Upload Failed', error.message);
      } else {
        toast.error('Upload Failed', 'Failed to upload preview images');
      }
    } finally {
      setIsUploadingPreviews(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/pdf', // .pdf
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/msword', // .doc
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.ms-excel' // .xls
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadErrors(prev => ({
          ...prev,
          file: 'Invalid file type. Only .docx, .pdf, .pptx, .xlsx files are allowed.'
        }));
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        setUploadErrors(prev => ({
          ...prev,
          file: 'File size exceeds 50MB limit.'
        }));
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
      // Clear only the 'file' error without mutating undefined
      setUploadErrors(prev => {
        const { file: _ignored, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest;
      });
    }
  };

  const validateUploadForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!uploadForm.file) {
      errors.file = 'Please select a file to upload.';
    }
    if (!uploadForm.title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!uploadForm.description.trim()) {
      errors.description = 'Description is required.';
    }
    if (!uploadForm.price.trim()) {
      errors.price = 'Price is required.';
    } else if (isNaN(Number(uploadForm.price)) || Number(uploadForm.price) < 0) {
      errors.price = 'Price must be a valid number.';
    }
    if (!uploadForm.categoryId) {
      errors.categoryId = 'Please select a category.';
    }

    setUploadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUploadForm() || !uploadForm.file) {
      return;
    }

    try {
      setIsProcessing(true);
      await uploadTemplate({
        file: uploadForm.file,
        title: uploadForm.title,
        description: uploadForm.description,
        price: String(uploadForm.price || ''),
        categoryId: String(uploadForm.categoryId || ''),
        isPremium: uploadForm.isPremium,
      });

      // Reset form and close modal
      setUploadForm({
        file: null,
        title: '',
        description: '',
        price: '',
        categoryId: '',
        isPremium: false
      });
      setUploadErrors({});
      setShowUploadModal(false);
      
      // Refresh templates list
      await fetchTemplates();
      
      // Check if user is admin to show appropriate message
      const userRolesString = localStorage.getItem('userRoles');
      let userRoles: string[] = [];
      try {
        userRoles = userRolesString ? JSON.parse(userRolesString) : [];
      } catch (error) {
        console.error('Error parsing user roles:', error);
      }
      
      const isAdmin = userRoles.includes('ROLE_ADMIN');
      if (isAdmin) {
        toast.success('Upload Successful', 'Template has been uploaded and automatically published!');
      } else {
        toast.success('Upload Successful', 'Template has been uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && (
        error.message.includes('Authentication') || 
        error.message.includes('Session expired') ||
        error.message.includes('Invalid session') ||
        error.message.includes('Server redirected')
      )) {
        toast.error('Session Expired', 'Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error instanceof Error && error.message.includes('multipart')) {
        toast.error('Upload Failed', 'Invalid file format. Please ensure the file is properly attached.');
      } else if (error instanceof Error && error.message.includes('File too large')) {
        toast.error('Upload Failed', 'File is too large. Maximum file size is 50MB.');
      } else {
        toast.error('Upload Failed', error instanceof Error ? error.message : 'An error occurred while uploading the template');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const closeUploadModal = () => {
    if (!isProcessing) {
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
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Published</span>;
      case 'APPROVED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case 'PENDING_REVIEW':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending Review</span>;
      case 'PENDING':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'REJECTED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        // If status is undefined or unknown, assume it needs review
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Needs Review</span>;
    }
  };

  return (
    <div className="p-6 ml-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Management</h1>
          <p className="text-gray-600">Review and manage templates in the system</p>
          
          {/* Status Information Notice */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Template Status Guide</h3>
                <p className="text-sm text-blue-700 mt-1">
                  • <span className="font-medium">Needs Review</span> (Orange): Templates without status - click <strong>Approve</strong> to publish
                  • <span className="font-medium">Pending Review</span> (Yellow): Templates awaiting admin review
                  • <span className="font-medium">Published/Approved</span> (Green): Live and available to users
                  • <span className="font-medium">Rejected</span> (Red): Not approved for publication
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.status === 'PUBLISHED' || t.status === 'APPROVED').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {templates.filter(t => t.status === 'PENDING_REVIEW').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {templates.filter(t => t.status === 'REJECTED').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Upload Template</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Template Cards */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
                <p className="text-gray-500 mt-4">Loading...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                    {/* Template Preview Image */}
                    <div className="relative h-32 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                      {(() => {
                        const previewSrc =
                          (template.previewImages && template.previewImages.length > 0)
                            ? template.previewImages[0]
                            : (template.images && template.images.length > 0)
                            ? template.images[0]
                            : undefined;
                        if (previewSrc) {
                          return (
                            <img
                              src={previewSrc}
                              alt={`${template.title} preview`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          );
                        }
                        // Default fallback image
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <div className="text-sm font-medium text-gray-500">No Preview</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {template.title}
                      </h3>
                      {getStatusBadge(template.status)}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {template.description.length > 120 
                        ? `${template.description.substring(0, 120)}...` 
                        : template.description
                      }
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Category:</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {template.category.name}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Author:</span>
                        <span className="text-gray-900 font-medium">{template.author.username}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Price:</span>
                        <span className="text-gray-900 font-semibold">
                          {template.price === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `${template.price.toLocaleString('vi-VN')} VND`
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => {
                            setSelectedTemplateForEdit(template);
                            setEditForm({
                              title: template.title || '',
                              description: template.description || '',
                              price: String(template.price ?? ''),
                              fileUrl: (template as { fileUrl?: string }).fileUrl || ''
                            });
                            setEditErrors({});
                            setShowEditModal(true);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {(template.status === 'PENDING_REVIEW' || !template.status) && (
                          <>
                            <button
                              onClick={() => handleApprove(template.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(template.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                        {template.status === 'APPROVED' && (
                          <button
                            onClick={() => handlePublish(template.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Publish
                          </button>
                        )}
                        {template.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleReject(template.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            Unpublish
                          </button>
                        )}
                        {template.status === 'REJECTED' && (
                          <button
                            onClick={() => handleApprove(template.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Re-approve
                          </button>
                        )}
                      </div>
                      
                      {/* Action Icons */}
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleDownload(template)}
                          disabled={downloadingTemplateId === template.id}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download template file"
                        >
                          {downloadingTemplateId === template.id ? (
                            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenPreviewModal(template.id)}
                          disabled={isProcessing}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Upload preview images"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          disabled={isProcessing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete template"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Pagination below template grid: */}
      <div className="flex justify-center my-8">
        <nav className="flex items-center space-x-2" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 ${currentPage === i + 1 ? 'text-white bg-green-600 border-green-600' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload Template</h2>
              <button
                onClick={closeUploadModal}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              {/* Admin Auto-Publish Notice */}
              {(() => {
                const userRolesString = localStorage.getItem('userRoles');
                let userRoles: string[] = [];
                try {
                  userRoles = userRolesString ? JSON.parse(userRolesString) : [];
                } catch (error) {
                  console.error('Error parsing user roles:', error);
                }
                
                const isAdmin = userRoles.includes('ROLE_ADMIN');
                if (isAdmin) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-800 font-medium">
                          Admin Notice: This template will be automatically published and available to users immediately.
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template File <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".docx,.pdf,.pptx,.xlsx,.doc,.ppt,.xls"
                          onChange={handleFileChange}
                          disabled={isProcessing}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      .docx, .pdf, .pptx, .xlsx up to 50MB
                    </p>
                    {uploadForm.file && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        Selected: {uploadForm.file.name}
                      </p>
                    )}
                  </div>
                </div>
                {uploadErrors.file && (
                  <p className="mt-2 text-sm text-red-600">{uploadErrors.file}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Professional Resume Template 2025"
                  disabled={isProcessing}
                />
                {uploadErrors.title && (
                  <p className="mt-2 text-sm text-red-600">{uploadErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Modern resume template for IT professionals"
                  disabled={isProcessing}
                />
                {uploadErrors.description && (
                  <p className="mt-2 text-sm text-red-600">{uploadErrors.description}</p>
                )}
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.price}
                    onChange={(e) => {
                      const next = e.target.value;
                      const numeric = Number(next || 0);
                      setUploadForm(prev => ({ ...prev, price: next, isPremium: numeric > 0 }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50000"
                    disabled={isProcessing}
                  />
                  {uploadErrors.price && (
                    <p className="mt-2 text-sm text-red-600">{uploadErrors.price}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.categoryId}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isProcessing}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {uploadErrors.categoryId && (
                    <p className="mt-2 text-sm text-red-600">{uploadErrors.categoryId}</p>
                  )}
                </div>
              </div>

              {/* Premium Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={uploadForm.isPremium}
                  onChange={() => setUploadForm(prev => ({ ...prev, isPremium: prev.isPremium }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  disabled={isProcessing || Number(uploadForm.price || 0) > 0 || Number(uploadForm.price || 0) === 0}
                />
                <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-700">
                  Mark as Premium Template (auto-set by price)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={isProcessing}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Template</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditModal && selectedTemplateForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Template</h2>
              <button
                onClick={() => { setShowEditModal(false); setSelectedTemplateForEdit(null); setEditErrors({}); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!editForm.title.trim()) errs.title = 'Title is required.';
                if (!editForm.description.trim()) errs.description = 'Description is required.';
                if (editForm.price === '' || isNaN(Number(editForm.price)) || Number(editForm.price) < 0) errs.price = 'Enter a valid price.';
                setEditErrors(errs);
                if (Object.keys(errs).length > 0 || !selectedTemplateForEdit) return;
                try {
                  setIsProcessing(true);
                  await updateTemplate(selectedTemplateForEdit.id, {
                    title: editForm.title.trim(),
                    description: editForm.description.trim(),
                    price: Number(editForm.price),
                    fileUrl: editForm.fileUrl.trim() || undefined,
                  });
                  await fetchTemplates();
                  setShowEditModal(false);
                  setSelectedTemplateForEdit(null);
                  toast.success('Template Updated', 'Changes saved successfully.');
                } catch (error) {
                  console.error('Error updating template:', error);
                  toast.error('Update Failed', error instanceof Error ? error.message : 'Could not update template');
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {editErrors.title && <p className="mt-1 text-sm text-red-600">{editErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {editErrors.description && <p className="mt-1 text-sm text-red-600">{editErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (VND) *</label>
                  <input
                    type="text"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editErrors.price && <p className="mt-1 text-sm text-red-600">{editErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File URL</label>
                  <input
                    type="text"
                    value={editForm.fileUrl}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedTemplateForEdit(null); }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Images Upload Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Preview Images</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedPreviewFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>File Requirements:</strong>
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                  <li>Image formats: .jpg, .png</li>
                  <li>Max file size: 3MB per image</li>
                  <li>Images will be resized to 1200x800px</li>
                </ul>
              </div>

              {/* File Input */}
              <div>
                <input
                  type="file"
                  id="admin-preview-files"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePreviewFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="admin-preview-files"
                  className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                >
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG (max 3MB each)
                  </p>
                </label>
              </div>

              {/* Selected Files */}
              {selectedPreviewFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Selected Files ({selectedPreviewFiles.length})
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedPreviewFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedPreviewFiles([]);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPreviews}
                  disabled={isUploadingPreviews || selectedPreviewFiles.length === 0}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUploadingPreviews ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedPreviewFiles.length > 0 ? selectedPreviewFiles.length : ''} Image${selectedPreviewFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Creation Modal */}
      {showPayoutModal && selectedTemplateForPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create Payout for Template</h2>
              <p className="text-sm text-gray-600 mt-1">
                Template: <span className="font-medium">{selectedTemplateForPayout.title}</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Template Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Template Price:</span>
                    <p className="font-medium text-gray-900">
                      {selectedTemplateForPayout.price?.toLocaleString() || 0} VND
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Author:</span>
                    <p className="font-medium text-gray-900">
                      {selectedTemplateForPayout.author?.username || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Amount */}
              <div>
                <label htmlFor="agreedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Amount (VND) *
                </label>
                <input
                  type="number"
                  id="agreedPrice"
                  value={payoutForm.agreedPrice || ''}
                  onChange={(e) => handlePayoutFormChange('agreedPrice', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    payoutErrors.agreedPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter payout amount"
                  min="0"
                  max="10000000"
                />
                {payoutErrors.agreedPrice && (
                  <p className="mt-1 text-sm text-red-600">{payoutErrors.agreedPrice}</p>
                )}
              </div>

              {/* Admin Note */}
              <div>
                <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Note (Optional)
                </label>
                <textarea
                  id="adminNote"
                  value={payoutForm.adminNote}
                  onChange={(e) => handlePayoutFormChange('adminNote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a note about this payout..."
                  rows={3}
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This will approve the template and create a payout record. 
                      You'll need to manually transfer the funds to the seller's bank account and then mark the payout as paid.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={handleClosePayoutModal}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayout}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve & Create Payout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

