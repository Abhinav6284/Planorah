import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectsTab({ portfolio }) {
  const projects = portfolio?.portfolio_projects || [];

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-charcoal border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold">Portfolio Projects</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">{projects.length} projects added</p>
          </div>
          <Link
            to="/projects"
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:opacity-90 transition-all text-sm"
          >
            Manage Projects
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-gray-50 dark:bg-charcoalDark/50 border border-gray-100 dark:border-white/10 rounded-2xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-gray-900 dark:text-white font-medium text-sm">
                      {project.display_title || project.project_title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {project.display_description || project.project_description}
                    </p>
                    {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {project.tech_stack.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-[11px] bg-gray-200 dark:bg-charcoal text-gray-600 dark:text-gray-400 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {project.is_featured && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-lg">
                        Featured
                      </span>
                    )}
                    {!project.is_visible && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-charcoalMuted rounded-2xl">
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">No projects added yet</p>
            <Link
              to="/projects"
              className="inline-block px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:opacity-90 transition-all text-sm"
            >
              Add Your First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
