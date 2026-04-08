import React, { useState } from 'react';
import { Calendar, MessageCircle, Paperclip, CheckCircle2, Loader2 } from 'lucide-react';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => Promise<void>;
}

const categoryColors: Record<string, string> = {
  Marketing: 'bg-blue-50 dark:bg-blue-900/30 text-[#3c50e0] dark:text-blue-400',
  Development: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  Dev: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  Template: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
};

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (!onComplete) return;
    setCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setCompleting(false);
    }
  };

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

      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 ${
            categoryColors[task.category] ?? 'bg-slate-100 text-slate-600'
          } text-[10px] font-bold rounded-full`}
        >
          {task.category}
        </span>

        {task.status !== 'completed' && onComplete && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-60"
          >
            {completing
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <CheckCircle2 className="w-3.5 h-3.5" />
            }
            Terminer
          </button>
        )}
      </div>
    </div>
  );
}
