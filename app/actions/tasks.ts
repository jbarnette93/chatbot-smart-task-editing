'use server';

import { supabase } from '@/lib/supabase';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { revalidatePath } from 'next/cache';

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: 'Task title is required' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title.trim(),
        user_email: input.userEmail || null,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true, data: data as Task };
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

/**
 * Get all tasks, optionally filtered by user email
 */
export async function getTasks(userEmail?: string): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });

    if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Task[] };
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    return { success: false, error: 'Failed to fetch tasks' };
  }
}

/**
 * Update a task
 */
export async function updateTask(
  id: string,
  updates: UpdateTaskInput
): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }

    const updateData: Partial<Task> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) {
      if (updates.title.trim().length === 0) {
        return { success: false, error: 'Task title cannot be empty' };
      }
      updateData.title = updates.title.trim();
    }

    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true, data: data as Task };
  } catch (error) {
    console.error('Unexpected error updating task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
