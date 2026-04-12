import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp } from 'lucide-react';
import { useRoadmapStore } from '../../stores/roadmapStore';
import RoadmapNode from './RoadmapNode';
import NodeDetail from './NodeDetail';

/**
 * RoadmapViewNew - Learning roadmap with status tracking
 *
 * Features:
 * - Header with title and description
 * - Progress bar showing completion %
 * - List of nodes in linear/vertical layout
 * - Click to expand node details
 * - Mock data initially (replaced with API in Task 11)
 *
 * State:
 * - Reads from useRoadmapStore: roadmaps, nodes, progress
 * - Actions: selectRoadmap, updateNodeStatus, calculateProgress
 */

// Mock data - will be replaced with API call in Task 11
const MOCK_ROADMAP = {
  title: 'Learn React',
  description: 'Master React fundamentals from basics to advanced concepts',
  nodes: [
    {
      id: 1,
      title: 'JSX & Components',
      description: 'Learn JSX syntax and how to create reusable components',
      status: 'completed',
      estimatedHours: 4,
      completedAt: new Date('2026-04-01'),
      resources: [
        { type: 'link', url: 'https://react.dev', title: 'React Official Docs' },
        { type: 'video', url: 'https://example.com', title: 'JSX Deep Dive' },
      ],
    },
    {
      id: 2,
      title: 'Props and State',
      description: 'Understand how to manage data flow with props and component state',
      status: 'completed',
      estimatedHours: 5,
      completedAt: new Date('2026-04-05'),
      resources: [
        { type: 'link', url: 'https://react.dev/learn', title: 'React State Guide' },
      ],
    },
    {
      id: 3,
      title: 'Hooks and Effects',
      description: 'Master useState, useEffect, and custom hooks for side effects',
      status: 'in_progress',
      estimatedHours: 6,
      completedAt: null,
      resources: [
        { type: 'link', url: 'https://react.dev/reference/react', title: 'Hooks Reference' },
        { type: 'article', url: 'https://example.com', title: 'useEffect Patterns' },
      ],
    },
    {
      id: 4,
      title: 'Context API',
      description: 'Learn how to manage global state with Context API',
      status: 'not_started',
      estimatedHours: 4,
      completedAt: null,
      resources: [
        { type: 'link', url: 'https://react.dev/reference/react/useContext', title: 'useContext Docs' },
      ],
    },
    {
      id: 5,
      title: 'Performance Optimization',
      description: 'Optimize React applications with memoization and lazy loading',
      status: 'not_started',
      estimatedHours: 7,
      completedAt: null,
      resources: [
        { type: 'link', url: 'https://react.dev/reference/react/memo', title: 'React.memo' },
        { type: 'article', url: 'https://example.com', title: 'Code Splitting Guide' },
      ],
    },
  ],
};

const RoadmapViewNew = () => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const {
    nodes,
    progress,
    setNodes,
    updateNodeStatus,
    calculateProgress,
  } = useRoadmapStore();

  // Initialize with mock data if empty
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(MOCK_ROADMAP.nodes);
      calculateProgress();
    }
  }, [nodes.length, setNodes, calculateProgress]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(nodeId);
  };

  const handleNodeDetailClose = () => {
    setSelectedNodeId(null);
  };

  const handleStatusChange = (nodeId, newStatus) => {
    updateNodeStatus(nodeId, newStatus);
    // Recalculate progress after status change
    setTimeout(() => {
      calculateProgress();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {MOCK_ROADMAP.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {MOCK_ROADMAP.description}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Your Progress
                </span>
              </div>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            {/* Progress Stats */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {nodes.filter((n) => n.status === 'completed').length} of {nodes.length} nodes completed
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Nodes List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 px-2">
            Learning Path
          </h2>

          <AnimatePresence mode="popLayout">
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <RoadmapNode
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {nodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 dark:text-gray-400">
              No nodes in this roadmap yet
            </p>
          </motion.div>
        )}
      </div>

      {/* Node Detail Panel */}
      <NodeDetail
        node={selectedNode}
        isOpen={selectedNodeId !== null}
        onClose={handleNodeDetailClose}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default RoadmapViewNew;
