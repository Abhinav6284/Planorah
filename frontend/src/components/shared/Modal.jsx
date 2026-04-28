import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, type: 'spring', damping: 20 }}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto ${className}`.trim()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className={title ? 'p-6' : 'p-6'}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
