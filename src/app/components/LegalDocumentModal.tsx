import { useState, useEffect } from 'react';

interface LegalDocumentModalProps {
  title: string;
  content: string;
  trigger: React.ReactNode;
  position?: 'left' | 'right';
}

export default function LegalDocumentModal({ title, content, trigger, position = 'left' }: LegalDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Don't prevent background scrolling to allow multiple modals
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openModal}
        className="font-medium text-green-600 hover:text-green-700 underline cursor-pointer transition-colors duration-200"
      >
        {trigger}
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeModal}
          />
          
          {/* Modal positioned to side */}
          <div 
            className={`fixed top-1/2 transform -translate-y-1/2 z-50 ${
              position === 'right' 
                ? 'right-4' 
                : 'left-4'
            }`}
          >
            <div 
              className="bg-white rounded-3xl max-w-2xl w-96 max-h-[80vh] flex flex-col shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="prose prose-lg prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {content}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/25"
              >
                Close
              </button>
            </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
