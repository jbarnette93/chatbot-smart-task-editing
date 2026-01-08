'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import { updateTask, deleteTask } from '@/app/actions/tasks';

interface TaskItemProps {
  task: Task;
  onUpdate?: () => void;
}

export default function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateTask(task.id, { completed: !task.completed });
      if (result.success) {
        onUpdate?.();
      } else {
        setError(result.error || 'Failed to update task');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateTask(task.id, { title: editTitle.trim() });
      if (result.success) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        setError(result.error || 'Failed to update task');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteTask(task.id);
      if (result.success) {
        onUpdate?.();
      } else {
        setError(result.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 border-l-4 border-blue-500">
      {error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          disabled={isLoading}
          className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editTitle.trim()}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3
                className={`text-lg font-medium ${
                  task.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {task.title}
              </h3>
              {task.enhanced_title && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 italic">
                  Enhanced: {task.enhanced_title}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {task.user_email && <span>By: {task.user_email}</span>}
                <span>•</span>
                <span>{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
              title="Edit task"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
              title="Delete task"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
