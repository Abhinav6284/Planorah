import React, { useEffect, useRef } from 'react';

const TextBlock = ({ block, onContentChange }) => {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onContentChange(e.target.value);
  };

  // Auto-expand textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 60)}px`;
    }
  }, [block.content]);

  return (
    <textarea
      ref={textareaRef}
      value={block.content || ''}
      onChange={handleChange}
      placeholder="Start typing..."
      className="w-full p-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none text-base leading-relaxed"
      rows={2}
    />
  );
};

export default TextBlock;
