import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`${sizeClass} border-gray-300 dark:border-slate-700 border-t-indigo-500 dark:border-t-blue-400 rounded-full animate-spin ${className}`.trim()}
    />
  );
};

export default Loader;
