import React from 'react';
import { Search, X } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

/**
 * SearchBar - Search input with clear functionality
 *
 * Features:
 * - Input with Search icon on left
 * - Clear button (X) appears when text is present
 * - Reads/writes searchQuery from workspaceStore
 * - Focus state with indigo border
 * - Dark mode support
 * - Max width constraint (md)
 *
 * Uses:
 * - useWorkspaceStore: searchQuery, setSearchQuery
 */
const SearchBar = () => {
  const searchQuery = useWorkspaceStore((state) => state.searchQuery);
  const setSearchQuery = useWorkspaceStore((state) => state.setSearchQuery);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex-1 max-w-md">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />

        {/* Input Field */}
        <input
          type="text"
          placeholder="Search notes, roadmaps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-transparent focus:border-accent-indigo focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
