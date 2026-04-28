import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useEditorStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        blocks: [],
        selectedBlockId: null,
        isDirty: false,
        isSaving: false,
        lastSaved: null,
        documentId: null,

        // Actions
        setBlocks: (blocks) =>
          set({ blocks, isDirty: true }, false, 'editorStore/setBlocks'),

        addBlock: (block) =>
          set(
            (state) => ({
              blocks: [...state.blocks, block],
              isDirty: true,
            }),
            false,
            'editorStore/addBlock'
          ),

        updateBlock: (blockId, updates) =>
          set(
            (state) => ({
              blocks: state.blocks.map((block) =>
                block.id === blockId ? { ...block, ...updates } : block
              ),
              isDirty: true,
            }),
            false,
            'editorStore/updateBlock'
          ),

        deleteBlock: (blockId) =>
          set(
            (state) => ({
              blocks: state.blocks.filter((block) => block.id !== blockId),
              selectedBlockId:
                state.selectedBlockId === blockId
                  ? null
                  : state.selectedBlockId,
              isDirty: true,
            }),
            false,
            'editorStore/deleteBlock'
          ),

        moveBlock: (blockId, newIndex) =>
          set(
            (state) => {
              const blocks = [...state.blocks];
              const currentIndex = blocks.findIndex((b) => b.id === blockId);
              if (currentIndex === -1) return {};

              const [block] = blocks.splice(currentIndex, 1);
              blocks.splice(newIndex, 0, block);
              return { blocks, isDirty: true };
            },
            false,
            'editorStore/moveBlock'
          ),

        setSelectedBlock: (selectedBlockId) =>
          set(
            { selectedBlockId },
            false,
            'editorStore/setSelectedBlock'
          ),

        setSaving: (isSaving) =>
          set({ isSaving }, false, 'editorStore/setSaving'),

        markSaved: () =>
          set(
            {
              isDirty: false,
              isSaving: false,
              lastSaved: new Date(),
            },
            false,
            'editorStore/markSaved'
          ),

        setDocumentId: (documentId) =>
          set({ documentId }, false, 'editorStore/setDocumentId'),
      }),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          blocks: state.blocks,
          documentId: state.documentId,
          lastSaved: state.lastSaved,
        }),
      }
    ),
    { name: 'editorStore' }
  )
);
