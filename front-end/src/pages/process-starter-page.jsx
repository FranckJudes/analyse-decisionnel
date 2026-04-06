import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Play, Plus, Trash2, RefreshCw, Home, ChevronRight,
  FileText, AlertCircle, Info, RotateCcw
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import WorkflowService from '../services/workflowService';

const COMMON_VARS = [
  { key: 'priority', value: 'MEDIUM', label: 'Priorité' },
  { key: 'department', value: '', label: 'Département' },
  { key: 'requestor', value: '', label: 'Demandeur' },
  { key: 'amount', value: 0, label: 'Montant' },
  { key: 'urgent', value: false, label: 'Urgent' },
];

export function ProcessStarterPage() {
  const [availableProcesses, setAvailableProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processVariables, setProcessVariables] = useState({});
  const [businessKey, setBusinessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const processes = await WorkflowService.getAvailableProcesses();
        setAvailableProcesses(Array.isArray(processes) ? processes : []);
      } catch {
        toast.error('Erreur lors du chargement des processus disponibles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProcessChange = (e) => {
    const key = e.target.value;
    const proc = availableProcesses.find((p) => p.key === key) || null;
    setSelectedProcess(proc);
    setProcessVariables({});
    setBusinessKey('');
  };

  const handleVarChange = (varKey, value) => {
    setProcessVariables((prev) => ({ ...prev, [varKey]: value }));
  };

  const handleVarKeyChange = (oldKey, newKey) => {
    setProcessVariables((prev) => {
      const copy = { ...prev };
      const val = copy[oldKey];
      delete copy[oldKey];
      copy[newKey] = val;
      return copy;
    });
  };

  const addVariable = () => {
    const key = prompt('Nom de la variable :');
    if (key?.trim()) handleVarChange(key.trim(), '');
  };

  const removeVariable = (key) => {
    setProcessVariables((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const addCommonVar = (varDef) => {
    handleVarChange(varDef.key, varDef.value);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!selectedProcess) { toast.error('Veuillez sélectionner un processus'); return; }
    setStarting(true);
    try {
      const userId = sessionStorage.getItem('userId') || '1';
      await WorkflowService.startProcess(
        selectedProcess.name || selectedProcess.key,
        userId,
        processVariables,
        businessKey || null
      );
      toast.success('Processus démarré avec succès !');
      setSelectedProcess(null);
      setProcessVariables({});
      setBusinessKey('');
    } catch {
      toast.error('Erreur lors du démarrage du processus');
    } finally {
      setStarting(false);
    }
  };

  const reset = () => {
    setSelectedProcess(null);
    setProcessVariables({});
    setBusinessKey('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <Play className="h-4 w-4" /> Démarrer un processus
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Démarrer un nouveau processus
                </h1>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <form onSubmit={handleStart} className="space-y-4">
                    {/* Process selector */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Processus à démarrer *
                      </label>
                      <select
                        value={selectedProcess?.key || ''}
                        onChange={handleProcessChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un processus...</option>
                        {availableProcesses.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.name || p.key} (v{p.version})
                          </option>
                        ))}
                      </select>
                      {availableProcesses.length === 0 && (
                        <p className="text-xs text-slate-400 mt-1">Aucun processus disponible</p>
                      )}
                    </div>

                    {/* Business key */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Clé métier (optionnel)
                      </label>
                      <input
                        type="text"
                        value={businessKey}
                        onChange={(e) => setBusinessKey(e.target.value)}
                        placeholder="Ex: CMD-2024-001, FACTURE-123..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Identifiant unique pour retrouver facilement cette instance
                      </p>
                    </div>

                    {/* Variables */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Variables du processus
                        </label>
                        <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                          <Plus className="h-3 w-3" /> Ajouter une variable
                        </Button>
                      </div>

                      {Object.keys(processVariables).length === 0 ? (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                          <Info className="h-4 w-4 flex-shrink-0" />
                          Aucune variable définie. Cliquez sur "Ajouter une variable" pour en créer.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                            <div className="col-span-4">Nom</div>
                            <div className="col-span-7">Valeur</div>
                            <div className="col-span-1" />
                          </div>
                          {Object.entries(processVariables).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  value={key}
                                  onChange={(e) => handleVarKeyChange(key, e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="col-span-7">
                                {typeof value === 'boolean' ? (
                                  <select
                                    value={value.toString()}
                                    onChange={(e) => handleVarChange(key, e.target.value === 'true')}
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="true">Vrai</option>
                                    <option value="false">Faux</option>
                                  </select>
                                ) : (
                                  <input
                                    type={typeof value === 'number' ? 'number' : 'text'}
                                    value={value}
                                    onChange={(e) => handleVarChange(key, typeof value === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                )}
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <button type="button" onClick={() => removeVariable(key)}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" variant="success" disabled={!selectedProcess || starting}>
                        {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        {starting ? 'Démarrage...' : 'Démarrer le processus'}
                      </Button>
                      <Button type="button" variant="outline" onClick={reset} disabled={starting}>
                        <RotateCcw className="h-4 w-4" /> Réinitialiser
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Help */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" /> Conseils
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <li className="flex gap-2"><span className="text-blue-500 mt-0.5">•</span> Sélectionnez le processus à démarrer</li>
                  <li className="flex gap-2"><span className="text-blue-500 mt-0.5">•</span> La clé métier permet d'identifier votre instance</li>
                  <li className="flex gap-2"><span className="text-blue-500 mt-0.5">•</span> Les variables sont transmises au processus</li>
                  <li className="flex gap-2"><span className="text-blue-500 mt-0.5">•</span> Suivez l'avancement dans la section Tâches</li>
                </ul>
              </CardContent>
            </Card>

            {/* Selected process info */}
            {selectedProcess && (
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" /> Processus sélectionné
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nom</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedProcess.name || selectedProcess.key}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Clé</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{selectedProcess.key}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version</span>
                      <span className="text-slate-700 dark:text-slate-300">v{selectedProcess.version}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Common variables */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Variables communes</h3>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400 mb-3">Cliquez pour ajouter rapidement</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_VARS.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => addCommonVar(v)}
                      className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
