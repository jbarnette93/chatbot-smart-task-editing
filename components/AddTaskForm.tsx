'use client';

import { useState } from 'react';
import { createTask } from '@/app/actions/tasks';

interface AddTaskFormProps {
  onTaskAdded?: () => void;
}

export default function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [enhanceWithAI, setEnhanceWithAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createTask({
        title,
        userEmail: userEmail.trim() || undefined,
      });

      if (result.success && result.data) {
        const taskId = result.data.id;
        setTitle('');
        setUserEmail('');
        onTaskAdded?.();

        // If enhance with AI is enabled, call the enhancement API
        if (enhanceWithAI && taskId) {
          setIsEnhancing(true);
          try {
            const enhanceResponse = await fetch('/api/enhance-task', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                taskId,
                title: result.data.title,
                userEmail: userEmail.trim() || undefined,
              }),
            });

            const enhanceData = await enhanceResponse.json();
            if (enhanceData.success) {
              setSuccessMessage('Task created and enhanced with AI!');
              onTaskAdded?.(); // Refresh to show enhanced title
            } else {
              setSuccessMessage('Task created, but enhancement failed. You can refresh to see the task.');
            }
          } catch (enhanceErr) {
            console.error('Enhancement error:', enhanceErr);
            setSuccessMessage('Task created, but enhancement failed. You can refresh to see the task.');
          } finally {
            setIsEnhancing(false);
          }
        } else {
          setSuccessMessage('Task created successfully!');
        }
      } else {
        setError(result.error || 'Failed to create task');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add New Task</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded">
            {successMessage}
          </div>
        )}

        {isEnhancing && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-400 text-blue-700 dark:text-blue-300 rounded">
            Enhancing task with AI...
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Email (optional)
            </label>
            <input
              type="email"
              id="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enhance"
              checked={enhanceWithAI}
              onChange={(e) => setEnhanceWithAI(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="enhance" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Enhance with AI (make title clearer and actionable)
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </form>
  );
}
