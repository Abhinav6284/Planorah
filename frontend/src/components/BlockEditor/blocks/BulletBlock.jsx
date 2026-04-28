import React from 'react';

const BulletBlock = ({ block, onContentChange }) => {
  const handleChange = (e) => {
    onContentChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-900 dark:text-white flex-shrink-0">•</span>
      <input
        type="text"
        value={block.content || ''}
        onChange={handleChange}
        placeholder="List item..."
        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-base"
      />
    </div>
  );
};

export default BulletBlock;
