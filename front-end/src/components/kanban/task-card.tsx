import React from 'react';
import { Calendar, MessageCircle, Paperclip } from 'lucide-react';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
}

const categoryColors: Record<string, string> = {
  Marketing: 'bg-blue-50 dark:bg-blue-900/30 text-[#3c50e0] dark:text-blue-400',
  Development: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  Dev: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  Template: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1">
          {task.title}
        </h3>
        <img
          alt="avatar"
          className="w-6 h-6 rounded-full ml-2"
          src={task.assigneeAvatar}
        />
      </div>

      {task.hasImage && (
        <div className="w-full h-32 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 mb-4 overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://placehold.co/400x200/png?text=Abstract+Waves')",
            }}
          />
        </div>
      )}

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {task.dueDate}
        </span>
        {task.attachments !== undefined && task.attachments > 0 && (
          <span className="flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" />
            {task.attachments}
          </span>
        )}
        {task.comments !== undefined && (
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            {task.comments}
          </span>
        )}
      </div>

      <span
        className={`inline-block px-3 py-1 ${
          categoryColors[task.category]
        } text-[10px] font-bold rounded-full`}
      >
        {task.category}
      </span>
    </div>
  );
}
