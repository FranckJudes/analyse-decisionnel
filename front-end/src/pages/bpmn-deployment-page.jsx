import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Play, RefreshCw, Home, ChevronRight, Zap,
  CheckCircle, XCircle, AlertCircle, Clock
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import toast from 'react-hot-toast';
import BpmnModelService from '../services/bpmnModelService';

export function BpmnDeploymentPage() {
  const [deployedProcesses, setDeployedProcesses] = useState([]);
  const [startedInstances, setStartedInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingProcess, setStartingProcess] = useState(null);
  const [activeTab, setActiveTab] = useState('deployed');
  const [error, setError] = useState(null);

  const fetchDeployedProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BpmnModelService.getDeployedProcesses();
      setDeployedProcesses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erreur lors de la récupération des processus déployés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedProcesses();
  }, []);

  const startProcessInstance = async (processKey) => {
    setStartingProcess(processKey);
    try {
      const response = await BpmnModelService.startProcessInstance(processKey);
      toast.success(`Instance démarrée : ${response?.instanceId || 'OK'}`);
      setStartedInstances((prev) => [
        {
          instanceId: response?.instanceId || `inst-${Date.now()}`,
          processKey,
          businessKey: response?.businessKey || null,
          status: 'STARTED',
          startTime: new Date().toLocaleString('fr-FR'),
        },
        ...prev,
      ]);
    } catch (err) {
      toast.error('Erreur lors du démarrage du processus');
    } finally {
      setStartingProcess(null);
    }
  };

  const tabs = [
    { id: 'deployed', label: 'Processus déployés', icon: <Zap className="h-4 w-4" /> },
    { id: 'instances', label: 'Instances démarrées', icon: <Clock className="h-4 w-4" /> },
  ];

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
            <Zap className="h-4 w-4" /> Statut des déploiements BPMN
          </span>
        </nav>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Statut des déploiements BPMN
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Gérez et démarrez vos processus BPMN déployés
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchDeployedProcesses} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
              </Button>
            </div>
          </CardHeader>
          <div className="px-6">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <CardContent>
            {activeTab === 'deployed' && (
              <>
                {error && (
                  <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {loading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : deployedProcesses.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-500">Aucun processus déployé</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Il n'y a actuellement aucun processus BPMN déployé dans le système.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          {['Clé', 'Nom', 'Version', 'ID déploiement', 'Statut', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {deployedProcesses.map((p) => (
                          <tr key={p.id || p.key} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{p.key}</td>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name || 'Non défini'}</td>
                            <td className="px-4 py-3 text-slate-500">{p.version}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.deploymentId}</td>
                            <td className="px-4 py-3">
                              {p.suspended ? (
                                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> Suspendu
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Actif
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => startProcessInstance(p.key)}
                                disabled={p.suspended || startingProcess === p.key}
                              >
                                <Play className="h-3 w-3" />
                                {startingProcess === p.key ? 'Démarrage...' : 'Démarrer'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'instances' && (
              <>
                {startedInstances.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-500">Aucune instance démarrée</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Démarrez une instance depuis l'onglet "Processus déployés".
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          {["ID d'instance", 'Clé de processus', 'Clé métier', 'Statut', 'Démarré le'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {startedInstances.map((inst) => (
                          <tr key={inst.instanceId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{inst.instanceId}</td>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{inst.processKey}</td>
                            <td className="px-4 py-3 text-slate-500">{inst.businessKey || '–'}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full text-xs font-medium">
                                <Play className="h-3 w-3" /> {inst.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{inst.startTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
