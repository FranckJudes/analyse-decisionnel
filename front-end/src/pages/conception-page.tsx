import React, { useCallback, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Play, RefreshCw, Loader2, AlertCircle, Layers, CheckCircle,
  Clock, ChevronDown, ChevronUp, ExternalLink, Trash2,
} from 'lucide-react';
import ConceptionService from '../services/conceptionService';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeployedProcess {
  id: string;
  key: string;
  name: string;
  version?: number;
  deploymentId?: string;
  resource?: string;
  deployedAt?: string;
}

interface ProcessInstance {
  id: string;
  processDefinitionKey?: string;
  processDefinitionId?: string;
  startTime?: string;
  state?: string;
  businessKey?: string;
}

// ─── Badge statut instance ────────────────────────────────────────────────────

function InstanceBadge({ state }: { state?: string }) {
  const s = (state ?? 'ACTIVE').toUpperCase();
  const cls =
    s === 'COMPLETED' || s === 'EXTERNALLY_TERMINATED'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : s === 'ACTIVE' || s === 'RUNNING'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {s === 'ACTIVE' || s === 'RUNNING' ? <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" /> : null}
      {s}
    </span>
  );
}

// ─── Panel instances (expandable) ────────────────────────────────────────────

function InstancesPanel({ processKey, instances }: { processKey: string; instances: ProcessInstance[] }) {
  const [open, setOpen] = useState(false);
  const relevant = instances.filter(
    i => i.processDefinitionKey === processKey || (i.processDefinitionId ?? '').includes(processKey),
  );
  if (relevant.length === 0) return <span className="text-xs text-slate-400">—</span>;

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#3c50e0] hover:underline"
      >
        {relevant.length} instance{relevant.length > 1 ? 's' : ''}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {relevant.map(inst => (
            <div key={inst.id} className="flex items-center justify-between gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
              <span className="font-mono text-slate-500 truncate max-w-[120px]">{inst.id.slice(0, 16)}…</span>
              <InstanceBadge state={inst.state} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function ConceptionPage() {
  const [processes, setProcesses]   = useState<DeployedProcess[]>([]);
  const [instances, setInstances]   = useState<ProcessInstance[]>([]);
  const [loading, setLoading]       = useState(true);
  const [launching, setLaunching]   = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [procs, insts] = await Promise.all([
        ConceptionService.getDeployedProcesses().catch(() => []),
        ConceptionService.getAllInstances().catch(() => []),
      ]);
      // Normalise les champs backend → interface locale
      const normalizedProcs = (Array.isArray(procs) ? procs : []).map((p: any) => ({
        id: p.id ?? p.processDefinitionId ?? String(Math.random()),
        key: p.key ?? p.processDefinitionKey ?? p.processDefinitionId ?? 'unknown',
        name: p.name ?? p.processName ?? p.processDefinitionKey ?? 'Sans nom',
        version: p.version ?? 1,
        deploymentId: p.deploymentId,
        resource: p.resource,
        deployedAt: p.deployedAt,
      }));
      setProcesses(normalizedProcs);
      // Normalise les instances : id doit être une string
      const normalizedInsts = (Array.isArray(insts) ? insts : []).map((i: any) => ({
        id: String(i.processInstanceId ?? i.id ?? Math.random()),
        processDefinitionKey: i.processDefinitionKey,
        processDefinitionId: i.processDefinitionId,
        startTime: i.startTime,
        state: i.state,
        businessKey: i.businessKey,
      }));
      setInstances(normalizedInsts);
    } catch {
      toast.error('Impossible de charger les processus.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDelete(proc: DeployedProcess) {
    if (!window.confirm(`Supprimer le processus "${proc.name}" ? Cette action est irréversible.`)) return;
    setDeleting(proc.key);
    try {
      await ConceptionService.deleteProcess(proc.key);
      setProcesses(prev => prev.filter(p => p.key !== proc.key));
      toast.success(`Processus "${proc.name}" supprimé.`);
    } catch {
      toast.error(`Erreur lors de la suppression de "${proc.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  async function handleLaunch(proc: DeployedProcess) {
    setLaunching(proc.key);
    try {
      const instance = await ConceptionService.startInstance(proc.key);
      // Ajouter l'instance localement (optimistic update)
      const newInst: ProcessInstance = {
        id: instance?.id ?? `local-${Date.now()}`,
        processDefinitionKey: proc.key,
        state: 'ACTIVE',
        startTime: new Date().toISOString(),
      };
      setInstances(prev => [newInst, ...prev]);
      toast.success(`Instance lancée pour "${proc.name}"`);
    } catch {
      toast.error(`Erreur au démarrage de "${proc.name}"`);
    } finally {
      setLaunching(null);
    }
  }

  const totalInstances = instances.length;
  const activeInstances = instances.filter(i => {
    const s = (i.state ?? '').toUpperCase();
    return s === 'ACTIVE' || s === 'RUNNING';
  }).length;

  return (
    <div className="px-6 py-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#3c50e0] uppercase">Pilotage BPMN</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Studio de conception</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Visualisez les processus déployés et lancez des instances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <Link
            to="/conception/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3c50e0] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2f3db3] transition-colors"
          >
            + Nouveau processus
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Processus déployés', value: processes.length, icon: Layers,       color: 'text-[#3c50e0]'    },
          { label: 'Instances totales',  value: totalInstances,   icon: CheckCircle,  color: 'text-slate-900 dark:text-white' },
          { label: 'Instances actives',  value: activeInstances,  icon: RefreshCw,    color: 'text-emerald-600'  },
          { label: 'Terminées',          value: totalInstances - activeInstances, icon: Clock, color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement des processus…
          </div>
        ) : processes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <AlertCircle className="w-10 h-10 opacity-30" />
            <p className="text-sm">Aucun processus déployé.</p>
            <Link
              to="/conception/nouveau"
              className="mt-1 px-4 py-2 text-sm font-medium bg-[#3c50e0] text-white rounded-lg hover:bg-[#2f3db3] transition-colors"
            >
              Créer un premier processus →
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['#', 'Processus', 'Version', 'Instances actives', 'Total lancées', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
              {processes.map((proc, idx) => {
                const active = instances.filter(i => {
                  const match = i.processDefinitionKey === proc.key || (i.processDefinitionId ?? '').includes(proc.key);
                  const s = (i.state ?? '').toUpperCase();
                  return match && (s === 'ACTIVE' || s === 'RUNNING');
                }).length;
                const isLaunching = launching === proc.key;

                return (
                  <tr key={proc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-4 text-xs font-semibold text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">{proc.name || proc.key}</p>
                      <p className="text-xs text-slate-400 font-mono">{proc.key}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        v{proc.version ?? 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {active > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          {active}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <InstancesPanel processKey={proc.key} instances={instances} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLaunch(proc)}
                          disabled={isLaunching}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#3c50e0] text-white rounded-lg hover:bg-[#2f3db3] disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {isLaunching
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Play className="w-3.5 h-3.5" />}
                          Lancer
                        </button>
                        <Link
                          to="/process-monitor"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Suivre
                        </Link>
                        <button
                          onClick={() => handleDelete(proc)}
                          disabled={deleting === proc.key}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deleting === proc.key
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Trash2 className="w-3 h-3" />}
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
