import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const FileViewerModal = ({ isOpen, onClose, file, fileType }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPDF = fileType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
      <div
        className="relative max-w-7xl max-h-[90vh] w-full bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <FiX size={24} className="text-gray-700" />
        </button>

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center p-4">
          {isPDF ? (
            <iframe src={file} className="w-full h-[80vh] border-0" title="PDF Viewer" />
          ) : (
            <img src={file} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
