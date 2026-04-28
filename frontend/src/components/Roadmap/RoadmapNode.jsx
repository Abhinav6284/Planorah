import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * RoadmapNode - Individual node in the roadmap
 *
 * Props:
 * - node: { id, title, description, status, estimatedHours }
 * - isSelected: boolean
 * - onClick: callback to select node
 * - onStatusChange: callback to update status
 *
 * Features:
 * - Status badge with colored circle
 * - Title and description
 * - Estimated hours
 * - Left border colored by status
 * - Click to expand detail panel
 * - Hover effect
 */
const RoadmapNode = ({ node, isSelected, onClick, onStatusChange }) => {
  const statusColors = {
    not_started: 'border-l-gray-400 dark:border-l-gray-600',
    in_progress: 'border-l-yellow-500 dark:border-l-yellow-400',
    completed: 'border-l-green-500 dark:border-l-green-400',
  };

  const borderColor = statusColors[node.status] || statusColors.not_started;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ x: 4 }}
      className={`
        relative flex gap-4 p-6 rounded-lg
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        border-l-4 ${borderColor}
        shadow-md hover:shadow-lg
        cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-blue-400' : ''}
      `}
      onClick={onClick}
    >
      {/* Status Badge */}
      <div className="flex-shrink-0 pt-1">
        <StatusBadge status={node.status} />
      </div>

      {/* Node Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {node.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {node.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>📚 {node.estimatedHours} hours</span>
          {node.completedAt && (
            <span>
              ✓ Completed {new Date(node.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Chevron Indicator */}
      <div className="flex-shrink-0 flex items-center text-gray-400 dark:text-gray-600">
        <motion.div
          animate={isSelected ? { x: 4 } : { x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RoadmapNode;
