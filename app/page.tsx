'use client';

import { useState } from 'react';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import Link from 'next/link';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskAdded = () => {
    // Force TaskList to refresh by changing key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Automation Challenge
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            To-Do List App with AI Enhancement
          </p>
          <nav className="mt-4">
            <Link
              href="/chat"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Chatbot →
            </Link>
          </nav>
        </header>

        <AddTaskForm onTaskAdded={handleTaskAdded} />
        <TaskList key={refreshKey} />
      </div>
    </main>
  );
}
