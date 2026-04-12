import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Check, AlertCircle } from 'lucide-react';
import Block from './Block';
import { BLOCK_TYPES } from './blocks';
import { useEditorStore } from '../../stores/editorStore';
import { useToast } from '../shared/Toast';
import { useDebounce } from '../../hooks/useDebounce';

const BlockEditor = () => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const { blocks, isDirty, isSaving, lastSaved, addBlock, moveBlock, setSaving, markSaved } =
    useEditorStore();
  const { showToast } = useToast();
  const debouncedIsDirty = useDebounce(isDirty, 3000);
  const saveTimeoutRef = useRef(null);

  // Auto-save effect
  useEffect(() => {
    if (!debouncedIsDirty) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Trigger save
    const performSave = async () => {
      setSaving(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        markSaved();
        showToast('Changes saved', 'success', 2000);
      } catch (error) {
        setSaving(false);
        showToast('Failed to save changes', 'error', 3000);
      }
    };

    // Set timeout to call performSave
    saveTimeoutRef.current = setTimeout(performSave, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedIsDirty, setSaving, markSaved, showToast]);

  const handleAddBlock = (type = BLOCK_TYPES.TEXT) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      metadata: {},
    };
    addBlock(newBlock);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      // Move block by id
      const blockId = blocks[draggedIndex].id;
      moveBlock(blockId, targetIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getStatusIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
          Saving...
        </div>
      );
    }

    if (isDirty) {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-4 h-4" />
          Unsaved changes
        </div>
      );
    }

    if (lastSaved) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="w-4 h-4" />
          All saved
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <div>{getStatusIndicator()}</div>
        </div>
      </div>

      {/* Blocks Container */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragEnd}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="popLayout">
          {blocks.length > 0 ? (
            <div className="space-y-0 max-w-3xl">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                >
                  <Block
                    block={block}
                    index={index}
                    onDragStart={handleDragStart}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-400 dark:text-gray-500">No blocks yet. Add one to get started.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Block Button */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2 max-w-3xl">
          <button
            onClick={() => handleAddBlock(BLOCK_TYPES.TEXT)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-150 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add text block
          </button>

          <button
            onClick={() => handleAddBlock(BLOCK_TYPES.HEADING)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-150 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Heading
          </button>

          <button
            onClick={() => handleAddBlock(BLOCK_TYPES.BULLET)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-150 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Bullet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockEditor;
