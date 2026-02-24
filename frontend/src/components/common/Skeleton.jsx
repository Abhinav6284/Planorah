import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton - Animated loading placeholder component.
 * Use to replace widgets/content while data is loading.
 * 
 * Variants:
 * - card: Full widget card skeleton with header and lines
 * - text: Single line of text
 * - circle: Avatar/icon placeholder
 * - chart: Chart area placeholder
 */

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
};

const SkeletonLine = ({ width = '100%', height = '12px', className = '' }) => (
  <motion.div
    className={`rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}
    style={{ width, height, backgroundSize: '400% 100%' }}
    animate={shimmer.animate}
    transition={shimmer.transition}
  />
);

const SkeletonCircle = ({ size = '40px', className = '' }) => (
  <motion.div
    className={`rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}
    style={{ width: size, height: size, backgroundSize: '400% 100%' }}
    animate={shimmer.animate}
    transition={shimmer.transition}
  />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <SkeletonCircle size="36px" />
      <SkeletonLine width="40%" height="16px" />
    </div>
    <SkeletonLine width="80%" />
    <SkeletonLine width="60%" />
    <SkeletonLine width="90%" />
  </div>
);

export const SkeletonChart = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4 ${className}`}>
    <SkeletonLine width="30%" height="16px" />
    <div className="flex items-end gap-2 h-32 pt-4">
      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
          style={{ height: `${h}%`, backgroundSize: '400% 100%' }}
          animate={shimmer.animate}
          transition={{ ...shimmer.transition, delay: i * 0.1 }}
        />
      ))}
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine key={i} width={`${85 - i * 10}%`} />
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
    {/* Greeting skeleton */}
    <div className="space-y-2">
      <SkeletonLine width="200px" height="20px" />
      <SkeletonLine width="300px" height="32px" />
    </div>
    {/* Widget grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 space-y-6">
        <SkeletonCard />
        <SkeletonChart />
        <SkeletonCard />
      </div>
      <div className="md:col-span-4 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

export { SkeletonLine, SkeletonCircle };
export default DashboardSkeleton;
