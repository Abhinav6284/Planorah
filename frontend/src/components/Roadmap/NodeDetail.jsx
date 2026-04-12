import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

/**
 * NodeDetail - Expanded detail panel for selected roadmap node
 *
 * Props:
 * - node: { id, title, description, status, estimatedHours, completedAt, resources }
 * - isOpen: boolean
 * - onClose: callback to close detail panel
 * - onStatusChange: callback to update node status
 *
 * Features:
 * - Full node information display
 * - Status toggle buttons (3 options)
 * - Resources list with links
 * - Estimated hours and completed date
 * - Close button
 * - Click outside to close
 */
const NodeDetail = ({ node, isOpen, onClose, onStatusChange }) => {
  if (!node) return null;

  const statusOptions = [
    { value: 'not_started', label: 'Not Started', color: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30' },
    { value: 'completed', label: 'Completed', color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30' },
  ];

  const handleStatusChange = (newStatus) => {
    onStatusChange(node.id, newStatus);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70"
          />

          {/* Detail Panel - Slide from right */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">
                {node.title}
              </h2>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {node.description}
                </p>
              </div>

              {/* Status Selection */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">
                  Status
                </h3>
                <div className="flex flex-col gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`
                        px-4 py-3 rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${
                          node.status === option.value
                            ? `ring-2 ring-offset-2 dark:ring-offset-gray-900 ${option.color} scale-105`
                            : `${option.color} hover:scale-105`
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Hours */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Estimated Hours
                </h3>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="text-lg font-bold">{node.estimatedHours}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">hours</span>
                </div>
              </div>

              {/* Completed Date */}
              {node.completedAt && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                    Completed
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(node.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Resources */}
              {node.resources && node.resources.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">
                    Resources
                  </h3>
                  <div className="space-y-2">
                    {node.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {resource.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NodeDetail;
