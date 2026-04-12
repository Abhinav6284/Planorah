import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import { getBlockComponent } from './blocks';
import { useEditorStore } from '../../stores/editorStore';

const Block = ({ block, index, onDragStart }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { deleteBlock, updateBlock } = useEditorStore();

  const BlockComponent = getBlockComponent(block.type);

  const handleContentChange = (content) => {
    updateBlock(block.id, { content });
  };

  const handleDelete = () => {
    deleteBlock(block.id);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(index);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group relative mb-1"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="flex items-stretch border-l-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-sm transition-colors duration-150"
        draggable
        onDragStart={handleDragStart}
      >
        {/* Drag Handle */}
        <div className="flex items-center justify-center flex-shrink-0 w-6 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <BlockComponent block={block} onContentChange={handleContentChange} />
        </div>

        {/* Delete Button */}
        <div className="flex items-center justify-center flex-shrink-0 w-6 ml-2">
          {isHovering && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleDelete}
              className="p-1 hover:text-red-500 dark:hover:text-red-400 text-gray-400 dark:text-gray-500 transition-colors duration-150"
              aria-label="Delete block"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Block;
