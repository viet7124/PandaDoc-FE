/**
 * File Upload Validation Utilities
 * 
 * Requirements:
 * - Template files (.docx, .pdf, .pptx, .xlsx) - Max 50MB
 * - User avatars (.jpg, .png) - Max 2MB, auto resize 300x300px
 * - Preview images (.jpg, .png) - Max 3MB per image, auto resize 1200x800px
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const FileType = {
  TEMPLATE: 'template',
  AVATAR: 'avatar',
  PREVIEW_IMAGE: 'preview_image'
} as const;

// File size constants (in bytes)
export const MAX_FILE_SIZES = {
  TEMPLATE: 50 * 1024 * 1024,      // 50MB
  AVATAR: 2 * 1024 * 1024,         // 2MB
  PREVIEW_IMAGE: 3 * 1024 * 1024   // 3MB per image
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  TEMPLATE: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/pdf', // .pdf
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/msword', // .doc (older format)
    'application/vnd.ms-powerpoint', // .ppt (older format)
    'application/vnd.ms-excel' // .xls (older format)
  ],
  AVATAR: [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ],
  PREVIEW_IMAGE: [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
};

// File extensions
export const ALLOWED_EXTENSIONS = {
  TEMPLATE: ['.docx', '.pdf', '.pptx', '.xlsx', '.doc', '.ppt', '.xls'],
  AVATAR: ['.jpg', '.jpeg', '.png'],
  PREVIEW_IMAGE: ['.jpg', '.jpeg', '.png']
};

/**
 * Validate file based on type
 */
export const validateFile = (file: File, type: keyof typeof FileType): FileValidationResult => {
  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[type.toUpperCase() as keyof typeof ALLOWED_FILE_TYPES];
  if (!allowedTypes.includes(file.type)) {
    const extensions = ALLOWED_EXTENSIONS[type.toUpperCase() as keyof typeof ALLOWED_EXTENSIONS];
    return {
      valid: false,
      error: `Invalid file type. Please upload ${extensions.join(', ')} files only.`
    };
  }

  // Check file size
  const maxSize = MAX_FILE_SIZES[type.toUpperCase() as keyof typeof MAX_FILE_SIZES];
  if (file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds ${sizeMB}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
    };
  }

  return { valid: true };
};

/**
 * Validate template file (docx, pdf, pptx, xlsx - Max 50MB)
 */
export const validateTemplateFile = (file: File): FileValidationResult => {
  return validateFile(file, 'TEMPLATE');
};

/**
 * Validate avatar image (jpg, png - Max 2MB)
 */
export const validateAvatarFile = (file: File): FileValidationResult => {
  return validateFile(file, 'AVATAR');
};

/**
 * Validate preview image (jpg, png - Max 3MB)
 */
export const validatePreviewImage = (file: File): FileValidationResult => {
  return validateFile(file, 'PREVIEW_IMAGE');
};

/**
 * Validate multiple preview images
 */
export const validatePreviewImages = (files: File[]): FileValidationResult => {
  for (let i = 0; i < files.length; i++) {
    const result = validatePreviewImage(files[i]);
    if (!result.valid) {
      return {
        valid: false,
        error: `File "${files[i].name}": ${result.error}`
      };
    }
  }
  return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
};

/**
 * Check if file extension is allowed
 */
export const isExtensionAllowed = (filename: string, type: keyof typeof FileType): boolean => {
  const ext = getFileExtension(filename);
  const allowedExts = ALLOWED_EXTENSIONS[type.toUpperCase() as keyof typeof ALLOWED_EXTENSIONS];
  return allowedExts.includes(ext);
};

/**
 * Create image preview URL from File
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Resize image to specific dimensions (for client-side preview)
 * Note: Actual resizing should be done on the backend
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, file.type);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

