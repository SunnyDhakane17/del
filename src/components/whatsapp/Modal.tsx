import React, { useEffect, useRef } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Accessibility and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the modal container
    modalRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full h-full max-w-full max-h-full outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white text-3xl focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        {/* Content */}
        <div className="flex items-center justify-center w-full h-full p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
