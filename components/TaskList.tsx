'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { getTasks } from '@/app/actions/tasks';
import TaskItem from './TaskItem';

interface TaskListProps {
  userEmail?: string;
}

export default function TaskList({ userEmail }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getTasks(userEmail);
      if (result.success && result.data) {
        setTasks(result.data);
      } else {
        setError(result.error || 'Failed to load tasks');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userEmail]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded-lg p-4">
          <p className="font-semibold">Error loading tasks</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No tasks yet. Add your first task above!</p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Your Tasks ({completedCount}/{totalCount} completed)
        </h2>
        <button
          onClick={fetchTasks}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
        ))}
      </div>
    </div>
  );
}
