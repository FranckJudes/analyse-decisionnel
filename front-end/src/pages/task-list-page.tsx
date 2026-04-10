import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Clock, Loader2, RefreshCw, Search,
  AlertCircle, Filter, ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthProvider';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

type TaskStatus = 'todo' | 'in-progress' | 'completed';

interface TaskRow {
  id: string;
  title: string;
  processName: string;
  assignee: string;
  dueDate: string;
  created: string;
  status: TaskStatus;
}

function mapDto(dto: any): TaskRow {
  return {
    id: dto.id ?? String(Math.random()),
    title: dto.name ?? dto.taskDefinitionKey ?? 'Tâche sans nom',
    processName: dto.processDefinitionId
      ? dto.processDefinitionId.split(':')[0]
      : dto.processDefinitionKey ?? '—',
    assignee: dto.assignee ?? '—',
    dueDate: dto.dueDate
      ? new Date(dto.dueDate).toLocaleDateString('fr-FR')
      : '—',
    created: dto.created
      ? new Date(dto.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '—',
    status: dto.suspended ? 'completed' : 'in-progress',
  };
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  'todo':        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'in-progress': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'completed':   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
};
const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': 'À faire', 'in-progress': 'En cours', 'completed': 'Terminé',
};

export function TaskListPage() {
  const { user } = useAuth() as any;
  const [tasks, setTasks]         = useState<TaskRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<TaskStatus | 'all'>('all');
  const [completing, setCompleting] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const url = user?.userId
        ? `${API_URL}/api/process-engine/tasks/user/${user.userId}`
        : `${API_URL}/api/process-engine/tasks/my-tasks`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      const list = data?.data ?? data;
      setTasks(Array.isArray(list) ? list.map(mapDto) : []);
    } catch {
      setError('Impossible de charger les tâches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [user?.userId]);

  const completeTask = async (id: string) => {
    setCompleting(id);
    try {
      const res = await fetch(`${API_URL}/api/process-engine/tasks/${id}/complete`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Tâche terminée !');
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    } catch (e: any) {
      toast.error(`Erreur : ${e.message}`);
    } finally {
      setCompleting(null);
    }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
      || t.processName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: tasks.length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Mes tâches</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">Liste des tâches</h1>
            {user?.email && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Connecté : <span className="font-medium">{user.email}</span>
              </p>
            )}
          </div>
          <button onClick={fetchTasks} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Status tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg gap-0.5">
            {([
              { key: 'all',         label: 'Toutes' },
              { key: 'in-progress', label: 'En cours' },
              { key: 'todo',        label: 'À faire' },
              { key: 'completed',   label: 'Terminées' },
            ] as { key: typeof statusFilter; label: string }[]).map(f => (
              <button key={f.key} onClick={() => setStatus(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  statusFilter === f.key
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}>
                {f.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-500 text-slate-600 dark:text-slate-200">
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg w-60 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
              <AlertCircle className="w-8 h-8 opacity-30" />
              <p className="text-sm">{error}</p>
              <button onClick={fetchTasks} className="text-indigo-600 text-sm hover:underline">Réessayer</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
              <CheckCircle2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">
                {tasks.length === 0
                  ? 'Aucune tâche assignée pour le moment.'
                  : 'Aucune tâche ne correspond aux filtres.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40">
                  {['Tâche', 'Processus', 'Assigné', 'Créé le', 'Échéance', 'Statut', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{task.id.slice(0, 12)}…</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{task.processName}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{task.assignee}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{task.created}</td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1 text-xs ${task.dueDate === '—' ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400 font-medium'}`}>
                        <Clock className="w-3 h-3" />{task.dueDate}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[task.status]}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={completing === task.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {completing === task.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle2 className="w-3.5 h-3.5" />
                          }
                          Terminer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-slate-400 text-right">
            {filtered.length} tâche{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
