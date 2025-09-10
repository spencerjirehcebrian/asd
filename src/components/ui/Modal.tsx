import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ModalProps } from '../../types';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, zIndex = 50 }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Find all open modals in DOM order
        const allModals = document.querySelectorAll('[data-modal="true"]');
        const currentModal = modalRef.current;
        
        if (currentModal && allModals.length > 0) {
          // Get the last modal in DOM order (highest in stack)
          const topModal = allModals[allModals.length - 1];
          
          // Only close if this is the topmost modal
          if (currentModal === topModal || currentModal.contains(topModal)) {
            event.stopPropagation();
            onClose();
          }
        }
      }
    };

    // Add event listener to capture phase to handle before other modals
    document.addEventListener('keydown', handleEscKey, { capture: true });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey, { capture: true });
      // Only restore scroll if this was the last modal
      const remainingModals = document.querySelectorAll('[data-modal="true"]');
      if (remainingModals.length <= 1) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      data-modal="true"
      className="fixed inset-0 flex items-center justify-center" 
      style={{ zIndex }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="glass-luxury rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-zinc-100">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};