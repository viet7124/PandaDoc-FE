import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  getTemplateById, 
  downloadTemplate, 
  purchaseTemplate, 
  getTemplateReviews,
  postTemplateReview,
  uploadPreviewImages,
  getPreviewImages,
  type Template,
  type Review,
  type CreateReviewRequest
} from '../TemplatePage/services/templateAPI';
import { getCollections, addTemplateToCollection, type Collection } from '../Profile/services/collectionsAPI';
import { getPurchasedTemplates } from '../Profile/services/purchasesAPI';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { validatePreviewImages } from '../../utils/fileValidation';

interface ErrorNotification {
  show: boolean;
  type: 'purchase_required' | 'not_in_library' | 'general_error';
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

export default function TemplateDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchasedByUser, setIsPurchasedByUser] = useState(false); // Local state to track purchase
  
  // Collection modal state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Error notification state
  const [errorNotification, setErrorNotification] = useState<ErrorNotification>({
    show: false,
    type: 'general_error',
    title: '',
    message: ''
  });

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState<CreateReviewRequest>({
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Preview images upload state
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [selectedPreviewFiles, setSelectedPreviewFiles] = useState<File[]>([]);
  const [isUploadingPreviews, setIsUploadingPreviews] = useState(false);

  // Helper functions defined before useEffect
  const checkIfPurchased = async (templateId: number) => {
    try {
      const purchasedTemplates = await getPurchasedTemplates();
      const purchased = purchasedTemplates.some(pt => pt.template.id === templateId);
      setIsPurchasedByUser(purchased);
      console.log('Template purchase status:', { templateId, purchased, purchasedCount: purchasedTemplates.filter(pt => pt.template.id === templateId).length });
    } catch (error) {
      console.error('Error checking purchase status:', error);
      // If error checking purchases, assume not purchased
      setIsPurchasedByUser(false);
    }
  };

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await getTemplateById(Number(id));
      console.log('📋 Template Data in TemplateDetail:', data);
      console.log('📋 Template Images in TemplateDetail:', data.images);
      console.log('📋 Has Images?:', data.images && data.images.length > 0);
      
      // If template doesn't have images in the response, try fetching them separately
      if (!data.images || data.images.length === 0) {
        console.log('⚠️ No images in template response, fetching separately...');
        try {
          const previewImages = await getPreviewImages(Number(id));
          console.log('📸 Fetched Preview Images separately:', previewImages);
          if (previewImages && previewImages.length > 0) {
            data.images = previewImages;
            console.log('✅ Updated template with preview images:', data.images);
          }
        } catch (error) {
          console.error('Failed to fetch preview images separately:', error);
        }
      }
      
      setTemplate(data);
      
      // Check if user has purchased this template (backend workaround)
      await checkIfPurchased(data.id);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Error Loading Template', 'Failed to load template details');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const data = await getTemplateReviews(Number(id));
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error toast for reviews - they're optional
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Error', 'Failed to load collections');
    } finally {
      setLoadingCollections(false);
    }
  };

  // useEffect must be called before any conditional returns
  useEffect(() => {
    if (id) {
      fetchTemplate();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Add focus handler to refresh purchase status when user returns to page
  useEffect(() => {
    const handleFocus = () => {
      if (template && id) {
        // Refresh purchase status when user returns to the page
        checkIfPurchased(template.id);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && template && id) {
        // Refresh purchase status when page becomes visible
        checkIfPurchased(template.id);
      }
    };

    // Listen for window focus and visibility change
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [template, id]);

  // Limit preview images to maximum of 4 for carousel - MUST be before conditional return
  const previewImages = useMemo(() => {
    const images = template?.images || [];
    return images.slice(0, 4);
  }, [template]);

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600 mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (previewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
    }
  };

  const prevImage = () => {
    if (previewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
    }
  };

  const handleShowCollectionModal = async () => {
    // Only allow adding to collection if the template is in the user's library
    if (!template) return;
    if (!(template.isPurchased || isPurchasedByUser)) {
      toast.info('Purchase required', 'You need to own this template before adding it to a collection.');
      return;
    }
    setShowCollectionModal(true);
    await fetchCollections();
  };

  const handleAddToCollection = async (collectionId: number) => {
    if (!template) return;
    
    try {
      setIsProcessing(true);
      await addTemplateToCollection(collectionId, template.id);
      toast.success('Added to Collection', 'Template added to collection successfully!');
      setShowCollectionModal(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast.warning('Already Added', 'This template may already be in your collection');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    if (!template) return;
    
    // Prevent duplicate purchases (check both backend and local state)
    if (template.isPurchased || isPurchasedByUser) {
      const message = template.price === 0 
        ? 'You already have this template in your library!'
        : 'You have already purchased this template! Check your Profile > Purchased Templates.';
      toast.info('Already Purchased', message);
      return;
    }
    
    // For free templates, add directly without payment page
    if (template.price === 0) {
      const result = await confirm({
        title: 'Add to Library',
        message: `Add "${template.title}" to your library? This is a FREE template - no payment required.`,
        type: 'info',
        confirmText: 'Add to Library',
        cancelText: 'Cancel'
      });

      if (!result) return;

      try {
        setIsProcessing(true);
        await purchaseTemplate(template.id);
        setIsPurchasedByUser(true);
        toast.success('Added to Library', 'Template added to your library! You can now download it anytime.');
        await checkIfPurchased(template.id);
      } catch (error) {
        console.error('Error adding template:', error);
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.message || error.response?.data;
          
          if (status === 400 || message?.includes('already purchased') || message?.includes('already')) {
            toast.info('Already Owned', 'You already have this template in your library!');
            setIsPurchasedByUser(true);
            await checkIfPurchased(template.id);
          } else {
            toast.error('Request Failed', 'Failed to process request. Please try again.');
          }
        } else {
          toast.error('Request Failed', 'Failed to process request. Please try again.');
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For paid templates, navigate to payment page
      navigate(`/payment/${template.id}`);
    }
  };

  const handleDownload = async () => {
    if (!template) return;

    // Check if user has purchased or added to library
    if (!template.isPurchased && !isPurchasedByUser) {
      if (template.price === 0) {
        // Free template not in library
        setErrorNotification({
          show: true,
          type: 'not_in_library',
          title: 'Template Not in Library',
          message: 'You need to add this free template to your library before downloading. Click the "Get Free Template" button above to add it to your library.',
          actionText: 'Get Free Template',
          actionLink: '#get-template'
        });
      } else {
        // Paid template not purchased
        setErrorNotification({
          show: true,
          type: 'purchase_required',
          title: 'Purchase Required',
          message: `This is a premium template priced at ${template.price.toLocaleString('vi-VN')} VND. You need to purchase it before downloading. Click "Buy Now" to complete your purchase.`,
          actionText: 'Buy Now',
          actionLink: '#buy-now'
        });
      }
      return;
    }

    try {
      setIsProcessing(true);
      const { blob, filename } = await downloadTemplate(template.id);
      
      // Use filename from server (includes correct extension like .pptx)
      const downloadFilename = filename || `${template.title}.${template.documentType || 'file'}`;
      
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
      console.error('Error downloading template:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        const errorType = template.price === 0 ? 'not_in_library' : 'purchase_required';
        const title = template.price === 0 ? 'Template Not in Library' : 'Purchase Required';
        const message = template.price === 0
          ? 'Please click "Get Free Template" first to add it to your library before downloading.'
          : 'Please purchase this template first before downloading.';
        
        setErrorNotification({
          show: true,
          type: errorType,
          title,
          message,
          actionText: template.price === 0 ? 'Get Free Template' : 'Buy Now',
          actionLink: template.price === 0 ? '#get-template' : '#buy-now'
        });
      } else {
        setErrorNotification({
          show: true,
          type: 'general_error',
          title: 'Download Failed',
          message: 'Failed to download template. Please try again or contact support if the problem persists.'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleErrorAction = () => {
    setErrorNotification({ show: false, type: 'general_error', title: '', message: '' });
    if (errorNotification.type === 'purchase_required' || errorNotification.type === 'not_in_library') {
      handleBuyNow();
    }
  };

  const handleEditTemplate = () => {
    navigate('/template-editor');
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!id || !template) return;
    
    if (!newReview.comment.trim()) {
      toast.error('Comment Required', 'Please write a comment for your review');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await postTemplateReview(Number(id), newReview);
      toast.success('Review Posted', 'Your review has been posted successfully!');
      setShowReviewModal(false);
      setNewReview({ rating: 5, comment: '' });
      await fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error posting review:', error);
      toast.error('Failed to Post Review', 'Please try again later');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle preview images upload
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

    setSelectedPreviewFiles(files);
  };

  const handleUploadPreviews = async () => {
    if (!id || selectedPreviewFiles.length === 0) return;

    try {
      setIsUploadingPreviews(true);
      await uploadPreviewImages(Number(id), selectedPreviewFiles);
      toast.success('Upload Successful', 'Preview images uploaded successfully!');
      setShowUploadPreview(false);
      setSelectedPreviewFiles([]);
      await fetchTemplate(); // Refresh template data
    } catch (error) {
      console.error('Error uploading preview images:', error);
      
      // Show specific error message
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('access')) {
          toast.error('Permission Denied', 'Only the template owner can upload preview images.');
        } else {
          toast.error('Upload Failed', error.message);
        }
      } else {
        toast.error('Upload Failed', 'Failed to upload preview images');
      }
    } finally {
      setIsUploadingPreviews(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              onClick={() => navigate(-1)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/templates" className="hover:text-green-600 transition-colors">Templates</Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">{template.title}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Template Preview */}
          <div className="space-y-6">
            {/* Image Carousel */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {/* Display actual preview images if available */}
                {previewImages.length > 0 ? (
                  <img
                    src={previewImages[currentImageIndex]}
                    alt={`${template.title} preview ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-in-out"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  /* Fallback when no preview images available */
                  <div className="absolute inset-4 bg-white rounded-lg shadow-inner p-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <div className="text-xl font-bold text-gray-400">No Preview Available</div>
                      <div className="text-sm text-gray-500">{template.title}</div>
                    </div>
                  </div>
                )}

                {/* Navigation arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image indicators */}
                {previewImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {previewImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Preview Images Button (only for template owner/admin) */}
            {(() => {
              // Check if current user is the template owner or admin
              const currentUsername = localStorage.getItem('username');
              const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
              const isOwner = currentUsername === template.author.username;
              const isAdmin = userRoles.includes('ROLE_ADMIN');
              const canUpload = isOwner || isAdmin;

              return canUpload ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <button
                    onClick={() => setShowUploadPreview(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Upload Preview Images
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Upload images to showcase your template
                  </p>
                </div>
              ) : null;
            })()}

            {/* Template Features */}
            {template.features && template.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What's included</h3>
                <ul className="space-y-3">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Template Details */}
          <div className="space-y-6">
            {/* Template Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {template.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🐼</span>
                </div>
                <span className="text-gray-700 font-medium">By {template.author.username}</span>
              </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center space-x-6 mb-6">
                {/* Star Rating Display */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-1 mr-2">
                    {[...Array(5)].map((_, i) => {
                      const rating = template.rating || 0;
                      const starValue = i + 1;
                      const isFilled = starValue <= rating;
                      const isHalfFilled = starValue - 0.5 <= rating && rating < starValue;
                      
                      return (
                        <div key={i} className="relative">
                          {/* Background star */}
                          <svg
                            className="w-4 h-4 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          
                          {/* Filled star overlay */}
                          {(isFilled || isHalfFilled) && (
                            <div 
                              className={`absolute top-0 left-0 overflow-hidden ${
                                isHalfFilled ? 'w-1/2' : 'w-full'
                              }`}
                            >
                              <svg
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-sm text-gray-600">
                    {template.rating ? `${template.rating.toFixed(1)}/5` : '0.0/5'} 
                    ({template.reviewCount || 0} review{(template.reviewCount || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
                
                {template.downloads !== undefined && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    {template.downloads} downloads
                  </div>
                )}
              </div>

              {/* Price and Purchase Status */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {template.price === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `${template.price.toLocaleString('vi-VN')} VND`
                    )}
                  </div>
                  {(template.isPurchased || isPurchasedByUser) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Purchased
                    </span>
                  )}
                </div>
                {(template.isPurchased || isPurchasedByUser) && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ You own this template. Download anytime!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Free Template - Get Button */}
                {template.price === 0 && !template.isPurchased && !isPurchasedByUser && (
                  <button
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                    className="w-full inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                    {isProcessing ? 'Adding...' : 'Get Free Template'}
                  </button>
                )}
                
                {/* Paid Template - Buy Button */}
                {template.price > 0 && !template.isPurchased && !isPurchasedByUser && (
                  <button
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                    className="w-full inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    {isProcessing ? 'Processing...' : 'Buy now'}
                  </button>
                )}
                
                {/* Already in Library */}
                {(template.isPurchased || isPurchasedByUser) && (
                  <div className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                    <div className="flex items-center justify-center text-green-700">
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg font-bold">
                        {template.price === 0 ? 'In Your Library' : 'Already Purchased'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center px-4 py-3 text-base font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </button>
                  
                  {(template.isPurchased || isPurchasedByUser) ? (
                    <button
                      onClick={handleShowCollectionModal}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center px-4 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                      </svg>
                      Add to collection
                    </button>
                  ) : (
                    <button
                      onClick={() => toast.info('Purchase required', 'Buy or add the free template to your library first.')}
                      className="inline-flex items-center justify-center px-4 py-3 text-base font-semibold text-gray-400 bg-white border-2 border-gray-200 rounded-lg cursor-not-allowed"
                      disabled
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                      </svg>
                      Purchase to collect
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleEditTemplate}
                  className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Template
                </button>
              </div>
            </div>

            {/* Template Specifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Template Details</h3>
              <div className="space-y-4">
                {template.documentType && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">Document Type:</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{template.documentType}</span>
                  </div>
                )}
                
                {template.slides && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      <span className="text-gray-700 font-medium">Number of slides:</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{template.slides}</span>
                  </div>
                )}
                
                {template.fileSize && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">File size:</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{template.fileSize}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Category:</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{template.category.name}</span>
                </div>
              </div>
            </div>

            {/* Template Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About this template</h3>
              <p className="text-gray-700 leading-relaxed">
                {template.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Reviews</h2>
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                Write a Review
              </button>
            </div>

            {loadingReviews ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p className="text-gray-600 text-lg font-medium">No reviews yet</p>
                <p className="text-gray-500 mt-2">Be the first to review this template!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {review.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.username}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-13">
                          {[...Array(5)].map((_, i) => {
                            const rating = review.rating || 0;
                            const starValue = i + 1;
                            const isFilled = starValue <= rating;
                            const isHalfFilled = starValue - 0.5 <= rating && rating < starValue;
                            
                            return (
                              <div key={i} className="relative">
                                {/* Background star */}
                                <svg
                                  className="w-5 h-5 text-gray-300"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                
                                {/* Filled star overlay */}
                                {(isFilled || isHalfFilled) && (
                                  <div 
                                    className={`absolute top-0 left-0 overflow-hidden ${
                                      isHalfFilled ? 'w-1/2' : 'w-full'
                                    }`}
                                  >
                                    <svg
                                      className="w-5 h-5 text-yellow-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed ml-13">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collection Selection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add to Collection</h3>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingCollections ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-600 mb-4">No collections yet</p>
                  <p className="text-sm text-gray-500">Create a collection in your profile first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      disabled={isProcessing}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{collection.name}</h4>
                          {collection.description && (
                            <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {collection.templateCount} templates
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Modal */}
      {errorNotification.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scale-in">
            <div className="p-6">
              {/* Icon based on error type */}
              <div className="flex items-center justify-center mb-4">
                {errorNotification.type === 'purchase_required' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errorNotification.type === 'not_in_library' && (
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errorNotification.type === 'general_error' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title and Message */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {errorNotification.title}
                </h3>
                <p className="text-gray-600">
                  {errorNotification.message}
                </p>
              </div>

              {/* Information Box */}
              {(errorNotification.type === 'purchase_required' || errorNotification.type === 'not_in_library') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Why do I need to do this?</p>
                      <p className="text-sm text-blue-800">
                        {errorNotification.type === 'purchase_required'
                          ? 'This ensures content creators are fairly compensated for their work and helps maintain the quality of our marketplace.'
                          : 'Adding templates to your library helps you organize and access your content easily. It only takes one click!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setErrorNotification({ show: false, type: 'general_error', title: '', message: '' })}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Close
                </button>
                {errorNotification.actionText && (
                  <button
                    onClick={handleErrorAction}
                    className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-semibold ${
                      errorNotification.type === 'purchase_required'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {errorNotification.actionText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-3 text-lg font-semibold text-gray-700">
                    {newReview.rating} / 5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={5}
                  placeholder="Share your experience with this template..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !newReview.comment.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Preview Images Modal */}
      {showUploadPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Preview Images</h3>
              <button
                onClick={() => setShowUploadPreview(false)}
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
                  id="preview-files"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePreviewFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="preview-files"
                  className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
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
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
                    setShowUploadPreview(false);
                    setSelectedPreviewFiles([]);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPreviews}
                  disabled={isUploadingPreviews || selectedPreviewFiles.length === 0}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingPreviews ? 'Uploading...' : 'Upload Images'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
