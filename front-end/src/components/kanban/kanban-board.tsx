import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { KanbanColumn } from './kanban-column';
import type { Task, KanbanColumn as KanbanColumnType } from '../../types/task';
import { useAuth } from '../../context/AuthProvider';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

type FilterType = 'all' | 'todo' | 'in-progress' | 'completed';

function mapTaskDTO(dto: any): Task {
  const state = dto.suspended ? 'completed' : 'in-progress';
  return {
    id: dto.id ?? String(Math.random()),
    title: dto.name ?? dto.taskDefinitionKey ?? 'Tâche sans nom',
    status: state,
    category: dto.processDefinitionId
      ? dto.processDefinitionId.split(':')[0]
      : 'Processus',
    dueDate: dto.dueDate
      ? new Date(dto.dueDate).toLocaleDateString('fr-FR')
      : 'Pas de date',
    description: dto.description ?? undefined,
    assigneeAvatar: `https://i.pravatar.cc/40?u=${dto.assignee ?? 'default'}`,
    processInstanceId: dto.processInstanceId,
  };
}

export function KanbanBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_URL}/api/process-engine/tasks/my-tasks`;
      // Si on a l'userId, utilise l'endpoint dédié
      if (user?.userId) {
        url = `${API_URL}/api/process-engine/tasks/user/${user.userId}`;
      }
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      const list = data?.data ?? data;
      setTasks(Array.isArray(list) ? list.map(mapTaskDTO) : []);
    } catch {
      setError('Impossible de charger les tâches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [user?.userId]);

  const completeTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/process-engine/tasks/${taskId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Tâche terminée !');
      // Move task to completed optimistically
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const } : t));
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' || t.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const columns: KanbanColumnType[] = [
    { id: 'todo',        title: 'À faire',      tasks: filtered.filter(t => t.status === 'todo') },
    { id: 'in-progress', title: 'En cours',      tasks: filtered.filter(t => t.status === 'in-progress') },
    { id: 'completed',   title: 'Terminé',       tasks: filtered.filter(t => t.status === 'completed') },
  ];

  const visibleColumns = activeFilter === 'all'
    ? columns
    : columns.filter(c => c.id === activeFilter);

  return (
    <section className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3c50e0]">Mes tâches</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Tableau Kanban — Tâches de processus
          </h1>
          {user?.email && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Connecté en tant que <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          {([
            { key: 'all',         label: 'Toutes',    count: counts.all },
            { key: 'todo',        label: 'À faire',   count: counts.todo },
            { key: 'in-progress', label: 'En cours',  count: counts['in-progress'] },
            { key: 'completed',   label: 'Terminées', count: counts.completed },
          ] as { key: FilterType; label: string; count: number }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                activeFilter === f.key
                  ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {f.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-500 text-slate-600 dark:text-slate-200">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            className="pl-4 pr-10 py-2 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg w-64 focus:ring-1 focus:ring-[#3c50e0] outline-none"
            placeholder="Rechercher une tâche…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des tâches…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <AlertCircle className="w-10 h-10 opacity-30" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchTasks} className="text-[#3c50e0] text-sm hover:underline">Réessayer</button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <AlertCircle className="w-10 h-10 opacity-30" />
          <p className="text-sm">Aucune tâche assignée pour le moment.</p>
          <p className="text-xs text-slate-400">Les tâches apparaissent ici lorsqu'une instance de processus vous est assignée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleColumns.map(column => (
            <KanbanColumn key={column.id} column={column} onComplete={completeTask} />
          ))}
        </div>
      )}
    </section>
  );
}
