import React from 'react';

/**
 * StatsCard Component
 * Reusable metric card for displaying dashboard statistics
 */
export default function StatsCard({
  icon,
  title,
  value,
  subtitle,
  className = '',
}) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-900
        border border-gray-200 dark:border-slate-700
        rounded-xl
        shadow-md hover:shadow-lg
        transition-shadow duration-200
        p-6
        flex flex-col gap-3
        ${className}
      `}
    >
      {/* Icon */}
      {icon && (
        <div className="text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>

      {/* Value and Subtitle */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {subtitle && (
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
