import React from 'react';

const HeadingBlock = ({ block, onContentChange }) => {
  const handleChange = (e) => {
    onContentChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={block.content || ''}
      onChange={handleChange}
      placeholder="Heading..."
      className="w-full text-4xl font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none"
    />
  );
};

export default HeadingBlock;
