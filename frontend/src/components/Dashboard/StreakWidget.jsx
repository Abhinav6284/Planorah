import React from 'react';
import { Flame } from 'lucide-react';

/**
 * StreakWidget Component
 * Displays current streak with flame icon
 */
export default function StreakWidget({ streak = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {streak}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Current Streak
        </p>
        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {streak} days
        </p>
      </div>
    </div>
  );
}
