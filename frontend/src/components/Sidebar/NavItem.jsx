import React from 'react';
import { motion } from 'framer-motion';

/**
 * NavItem - Individual navigation item with icon, label, and active state
 *
 * Props:
 * - id: Unique identifier for the nav item
 * - label: Display label for the nav item
 * - icon: React component (lucide-react icon)
 * - isActive: Boolean indicating if this is the active nav item
 * - isExpanded: Boolean indicating if sidebar is expanded
 * - onClick: Callback when nav item is clicked
 */
const NavItem = ({
  id,
  label,
  icon: Icon,
  isActive,
  isExpanded,
  onClick,
}) => {
  const baseStyles =
    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group';

  const activeStyles = isActive
    ? 'bg-indigo-500 text-white shadow-md'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700';

  const itemClassName = `${baseStyles} ${activeStyles}`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={itemClassName}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      title={!isExpanded ? label : ''}
      aria-label={label}
      aria-current={isActive ? 'page' : 'false'}
    >
      {/* Icon - Always visible */}
      <Icon
        className="w-5 h-5 flex-shrink-0"
        strokeWidth={2}
        aria-hidden="true"
      />

      {/* Label - Only visible when expanded */}
      {isExpanded && (
        <motion.span
          className="text-sm font-medium whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      )}

      {/* Active indicator dot - on the right */}
      {isActive && (
        <motion.div
          className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
};

export default NavItem;
