/**
 * Toast Notification System - Usage Examples
 * 
 * Import the useToast hook in any component:
 * import { useToast } from '../contexts/ToastContext';
 * 
 * Then use it like this:
 */

// Example 1: Basic usage
/*
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Your template has been uploaded successfully');
  };

  const handleError = () => {
    toast.error('Error!', 'Failed to upload template. Please try again.');
  };

  const handleWarning = () => {
    toast.warning('Warning!', 'This template already exists in your library');
  };

  const handleInfo = () => {
    toast.info('Info', 'New features are available!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
*/

// Example 2: Custom duration (in milliseconds)
/*
const toast = useToast();

// Show for 3 seconds
toast.success('Quick message', 'This will disappear in 3 seconds', 3000);

// Show for 10 seconds  
toast.error('Important', 'This will stay for 10 seconds', 10000);

// Show indefinitely (user must close manually)
toast.info('Permanent', 'This stays until closed', 0);
*/

// Example 3: Replace alert() calls
/*
// Before:
alert('Template uploaded successfully!');

// After:
toast.success('Success', 'Template uploaded successfully!');

// Before:
if (!user) {
  alert('Please login first');
  return;
}

// After:
if (!user) {
  toast.warning('Authentication Required', 'Please login first');
  return;
}
*/

// Example 4: In async functions
/*
const handleUpload = async () => {
  try {
    await uploadTemplate(data);
    toast.success('Upload Complete', 'Your template is now live!');
  } catch (error) {
    toast.error('Upload Failed', error.message || 'Please try again');
  }
};
*/

// Example 5: Multiple toasts
/*
const handleBulkAction = async () => {
  toast.info('Processing', 'Starting bulk upload...');
  
  try {
    await processFiles();
    toast.success('Complete', 'All files uploaded successfully!');
  } catch (error) {
    toast.error('Failed', 'Some files failed to upload');
  }
};
*/

export {}; // This file is for documentation only

