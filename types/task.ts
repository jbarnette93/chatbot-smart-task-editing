export interface Task {
  id: string;
  title: string;
  completed: boolean;
  user_email: string | null;
  enhanced_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  userEmail?: string;
}

export interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
}
