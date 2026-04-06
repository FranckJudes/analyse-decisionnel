import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Play, Square, CheckCircle, AlertCircle, Calendar, Info,
  Home, ChevronRight, GitBranch, X, RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import WorkflowService from '../services/workflowService';

const AVAILABLE_PROCESSES = [
  { id: 'process-1', name: 'Validation de document' },
  { id: 'process-2', name: "Onboarding d'un nouvel employé" },
  { id: 'process-3', name: 'Approbation de congés' },
  { id: 'process-4', name: "Demande d'achat" },
];

const STATUS_CONFIG = {
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', Icon: Play },
  COMPLETED: { label: 'Terminé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', Icon: CheckCircle },
  SUSPENDED: { label: 'Suspendu', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', Icon: Square },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-600', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <cfg.Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

function formatDate(str) {
  if (!str) return '–';
  return new Date(str).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StartModal({ onClose, onStart }) {
  const [selectedProcess, setSelectedProcess] = useState('');
  const [variables, setVariables] = useState({});
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    if (!selectedProcess) { toast.error('Veuillez sélectionner un processus'); return; }
    setStarting(true);
    try {
      await onStart(selectedProcess, variables);
      onClose();
    } finally {
      setStarting(false);
    }
  };

  const proc = AVAILABLE_PROCESSES.find((p) => p.id === selectedProcess);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Démarrer un nouveau processus</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Sélectionnez un processus</label>
            <select value={selectedProcess} onChange={(e) => { setSelectedProcess(e.target.value); setVariables({}); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Sélectionnez --</option>
              {AVAILABLE_PROCESSES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {selectedProcess === 'process-1' && (
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Nom du document</label>
              <input type="text" value={variables.documentName || ''} onChange={(e) => setVariables({ ...variables, documentName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {selectedProcess === 'process-2' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Nom de l'employé</label>
                <input type="text" value={variables.employeeName || ''} onChange={(e) => setVariables({ ...variables, employeeName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Département</label>
                <input type="text" value={variables.department || ''} onChange={(e) => setVariables({ ...variables, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
          {selectedProcess === 'process-3' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Date de début</label>
                  <input type="date" value={variables.startDate || ''} onChange={(e) => setVariables({ ...variables, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Date de fin</label>
                  <input type="date" value={variables.endDate || ''} onChange={(e) => setVariables({ ...variables, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Motif</label>
                <textarea value={variables.reason || ''} onChange={(e) => setVariables({ ...variables, reason: e.target.value })} rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          <Button variant="primary" size="sm" onClick={handleStart} disabled={!selectedProcess || starting}>
            {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Démarrer
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ workflow, onClose }) {
  if (!workflow) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Détails du workflow</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          {[
            { label: 'ID', value: workflow.id },
            { label: 'Processus', value: workflow.processName },
            { label: 'Démarré le', value: formatDate(workflow.startDate) },
            { label: 'Initiateur', value: workflow.initiator?.name },
            { label: 'Tâche actuelle', value: workflow.currentTask },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-900 dark:text-white text-right">{value || '–'}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-slate-500">Statut</span>
            <StatusBadge status={workflow.status} />
          </div>
          {workflow.variables && Object.keys(workflow.variables).length > 0 && (
            <div>
              <p className="text-slate-500 mb-1">Variables</p>
              <pre className="text-xs bg-slate-50 dark:bg-slate-900 rounded-lg p-3 overflow-auto text-slate-700 dark:text-slate-300">
                {JSON.stringify(workflow.variables, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="primary" size="sm" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const userId = sessionStorage.getItem('userId') || '1';

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await WorkflowService.getActiveInstances(userId);
      setWorkflows(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement des workflows');
      // Fallback data for demo
      setWorkflows([
        { id: 'wf1', processName: 'Validation de document', status: 'ACTIVE', startDate: '2025-05-15T14:20:00', currentTask: 'Révision par le responsable', initiator: { id: '1', name: 'Utilisateur Actuel' }, variables: { documentName: 'Rapport Q1 2025.pdf' } },
        { id: 'wf2', processName: "Onboarding d'un nouvel employé", status: 'ACTIVE', startDate: '2025-05-10T09:00:00', currentTask: 'Configuration du poste de travail', initiator: { id: '1', name: 'Utilisateur Actuel' }, variables: { employeeName: 'Jean Dupont', department: 'IT' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const handleStartProcess = async (processId, variables) => {
    const proc = AVAILABLE_PROCESSES.find((p) => p.id === processId);
    try {
      await WorkflowService.startProcess(proc.name, userId, variables);
      toast.success(`Processus "${proc.name}" démarré avec succès`);
      fetchWorkflows();
    } catch {
      toast.error('Erreur lors du démarrage du processus');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <GitBranch className="h-4 w-4" /> Gestion des workflows
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Gestion des workflows</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Suivez et gérez vos processus métier en cours
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchWorkflows} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowStartModal(true)}>
              <Play className="h-4 w-4" /> Démarrer un processus
            </Button>
          </div>
        </div>

        {/* Workflow list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12 text-slate-400">
                <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun workflow actif</p>
                <p className="text-sm mt-1">Démarrez un nouveau processus pour commencer.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <Card key={wf.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{wf.processName}</h3>
                        <StatusBadge status={wf.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(wf.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3.5 w-3.5" /> <strong className="text-slate-700 dark:text-slate-300">Tâche :</strong> {wf.currentTask}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(wf)}>
                      <Info className="h-4 w-4" /> Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showStartModal && (
        <StartModal onClose={() => setShowStartModal(false)} onStart={handleStartProcess} />
      )}
      {selectedWorkflow && (
        <DetailsModal workflow={selectedWorkflow} onClose={() => setSelectedWorkflow(null)} />
      )}
    </div>
  );
}
