export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export type TaskCategory = 'Marketing' | 'Development' | 'Dev' | 'Template';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string;
  assigneeAvatar: string;
  comments?: number;
  attachments?: number;
  hasImage?: boolean;
  description?: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}
