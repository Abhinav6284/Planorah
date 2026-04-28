import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useRoadmapStore = create(
  devtools(
    (set, get) => ({
      // State
      roadmaps: [],
      selectedRoadmapId: null,
      nodes: [],
      isLoading: false,
      progress: 0,

      // Actions
      setRoadmaps: (roadmaps) =>
        set({ roadmaps }, false, 'roadmapStore/setRoadmaps'),

      selectRoadmap: (selectedRoadmapId) =>
        set(
          { selectedRoadmapId },
          false,
          'roadmapStore/selectRoadmap'
        ),

      setNodes: (nodes) =>
        set({ nodes }, false, 'roadmapStore/setNodes'),

      updateNodeStatus: (nodeId, status) =>
        set(
          (state) => ({
            nodes: state.nodes.map((node) =>
              node.id === nodeId ? { ...node, status } : node
            ),
          }),
          false,
          'roadmapStore/updateNodeStatus'
        ),

      setProgress: (progress) =>
        set({ progress }, false, 'roadmapStore/setProgress'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'roadmapStore/setLoading'),

      calculateProgress: () => {
        const state = get();
        if (state.nodes.length === 0) {
          set({ progress: 0 });
          return 0;
        }

        const completedNodes = state.nodes.filter(
          (node) => node.status === 'completed'
        ).length;
        const newProgress = Math.round(
          (completedNodes / state.nodes.length) * 100
        );

        set({ progress: newProgress }, false, 'roadmapStore/calculateProgress');
        return newProgress;
      },
    }),
    { name: 'roadmapStore' }
  )
);
