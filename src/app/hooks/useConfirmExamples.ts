/**
 * Examples of how to use the useConfirm hook
 */

import { useConfirm } from '../contexts/ConfirmContext';

export const ConfirmExamples = () => {
  const { confirm } = useConfirm();

  // Example 1: Simple confirm
  const handleDelete = async () => {
    const result = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (result) {
      // User clicked confirm
      console.log('Item deleted');
    } else {
      // User clicked cancel
      console.log('Deletion cancelled');
    }
  };

  // Example 2: With callbacks
  const handleApprove = async () => {
    await confirm({
      title: 'Approve Template',
      message: 'Are you sure you want to approve this template?',
      type: 'success',
      confirmText: 'Approve',
      onConfirm: async () => {
        // This runs when user confirms
        console.log('Approving...');
      },
      onCancel: () => {
        // This runs when user cancels
        console.log('Cancelled');
      }
    });
  };

  // Example 3: Warning type
  const handleRemove = async () => {
    const result = await confirm({
      title: 'Remove Template',
      message: 'This will remove the template from your collection.',
      type: 'warning',
      confirmText: 'Remove',
    });

    if (result) {
      // Remove logic
    }
  };

  // Example 4: Info type
  const handleSave = async () => {
    const result = await confirm({
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      type: 'info',
      confirmText: 'Save',
      cancelText: 'Discard'
    });

    if (result) {
      // Save logic
    }
  };

  return null;
};

