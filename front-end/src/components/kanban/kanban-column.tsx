import React from 'react';
import { MoreVertical } from 'lucide-react';
import { TaskCard } from './task-card';
import type { KanbanColumn as KanbanColumnType } from '../../types/task';

interface KanbanColumnProps {
  column: KanbanColumnType;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300';
      case 'in-progress':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      default:
        return 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900 dark:text-white">{column.title}</h2>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(
              column.id
            )}`}
          >
            {column.tasks.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
