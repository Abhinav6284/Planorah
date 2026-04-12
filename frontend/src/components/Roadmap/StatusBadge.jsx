import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

/**
 * StatusBadge - Visual status indicator for roadmap nodes
 *
 * Props:
 * - status: 'not_started' | 'in_progress' | 'completed'
 *
 * Displays:
 * - Gray circle: not_started
 * - Yellow animated pulse: in_progress
 * - Green checkmark: completed
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    not_started: {
      color: 'text-gray-400 dark:text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      icon: Circle,
      label: 'Not Started',
    },
    in_progress: {
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: Clock,
      label: 'In Progress',
      animate: true,
    },
    completed: {
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: CheckCircle2,
      label: 'Completed',
    },
  };

  const config = statusConfig[status] || statusConfig.not_started;
  const IconComponent = config.icon;

  return (
    <motion.div
      className={`flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor}`}
      animate={
        config.animate
          ? {
              scale: [1, 1.1, 1],
            }
          : undefined
      }
      transition={
        config.animate
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
      title={config.label}
    >
      <IconComponent className={`w-6 h-6 ${config.color}`} strokeWidth={2} />
    </motion.div>
  );
};

export default StatusBadge;
