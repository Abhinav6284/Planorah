import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      return () => clearTimeout(timer);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { showToast, removeToast, toasts };
};

// Toast container component
export const ToastContainer = ({ toasts, onRemove }) => {
  const getIconAndColor = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50 dark:bg-green-900',
          textColor: 'text-green-800 dark:text-green-100',
          borderColor: 'border-green-200 dark:border-green-700',
          iconColor: 'text-green-500 dark:text-green-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50 dark:bg-red-900',
          textColor: 'text-red-800 dark:text-red-100',
          borderColor: 'border-red-200 dark:border-red-700',
          iconColor: 'text-red-500 dark:text-red-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900',
          textColor: 'text-yellow-800 dark:text-yellow-100',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          iconColor: 'text-yellow-500 dark:text-yellow-400',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900',
          textColor: 'text-blue-800 dark:text-blue-100',
          borderColor: 'border-blue-200 dark:border-blue-700',
          iconColor: 'text-blue-500 dark:text-blue-400',
        };
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon, bgColor, textColor, borderColor, iconColor } =
            getIconAndColor(toast.type);

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-sm pointer-events-auto`}
            >
              <div className={`flex-shrink-0 ${iconColor}`}>{icon}</div>
              <p className={`flex-1 text-sm font-medium ${textColor}`}>
                {toast.message}
              </p>
              <button
                onClick={() => onRemove(toast.id)}
                className={`flex-shrink-0 ${textColor} hover:opacity-75 transition-opacity`}
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
