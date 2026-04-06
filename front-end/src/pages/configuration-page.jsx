import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Play, Edit, RefreshCw, Plus, Search, ChevronRight, X,
  CheckCircle, XCircle, Settings, Home, Tag
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import BpmnModelService from '../services/bpmnModelService';

export function ConfigurationPage() {
  const [deployedProcesses, setDeployedProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [startingProcess, setStartingProcess] = useState(null);

  const fetchDeployedProcesses = async () => {
    setLoading(true);
    try {
      const data = await BpmnModelService.getMyDeployedProcesses();
      setDeployedProcesses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Erreur lors du chargement des processus déployés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedProcesses();
  }, []);

  const handleStartProcess = async (processKey) => {
    setStartingProcess(processKey);
    try {
      await BpmnModelService.startProcessInstanceViaEngine(processKey);
      toast.success('Instance de processus démarrée avec succès');
    } catch (err) {
      toast.error('Erreur lors du démarrage du processus');
    } finally {
      setStartingProcess(null);
    }
  };

  const filteredProcesses = deployedProcesses.filter((p) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !p.suspended) ||
      (statusFilter === 'suspended' && p.suspended);
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      !searchText ||
      (p.processName || '').toLowerCase().includes(searchLower) ||
      (p.processDescription || '').toLowerCase().includes(searchLower) ||
      (p.processDefinitionKey || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

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
            <Settings className="h-4 w-4" /> Configuration
          </span>
        </nav>

        {/* Header */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Processus déployés ({deployedProcesses.length})
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Gérez et configurez vos processus BPMN déployés
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/conception/nouveau">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4" /> Nouveau processus
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={fetchDeployedProcesses} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un processus..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <CardContent>
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                <span className="ml-3 text-slate-500">Chargement...</span>
              </div>
            </CardContent>
          ) : filteredProcesses.length === 0 ? (
            <CardContent>
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun processus déployé</p>
                <p className="text-sm mt-1">
                  {searchText || statusFilter !== 'all'
                    ? 'Aucun résultat pour ces critères.'
                    : 'Commencez par concevoir un nouveau processus BPMN.'}
                </p>
              </div>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">N°</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Nom</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Créé le</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Instances</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Tags</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredProcesses.map((process, index) => (
                    <tr
                      key={process.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      onClick={() => { setSelectedProcess(process); setDrawerOpen(true); }}
                    >
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {process.processName || process.processDefinitionKey || 'Non défini'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs">
                        {process.processDescription
                          ? process.processDescription.length > 50
                            ? process.processDescription.slice(0, 50) + '...'
                            : process.processDescription
                          : <span className="italic text-xs">Pas de description</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {process.deployedAt ? new Date(process.deployedAt).toLocaleDateString('fr-FR') : '–'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-semibold">{process.activeInstanceCount || 0}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{process.instanceCount || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        {process.suspended ? (
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
                        <div className="flex flex-wrap gap-1">
                          {(process.processTags || []).slice(0, 2).map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                              <Tag className="h-2.5 w-2.5" />{tag}
                            </span>
                          ))}
                          {(process.processTags || []).length > 2 && (
                            <span className="text-xs text-slate-400">+{process.processTags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartProcess(process.processDefinitionKey)}
                            disabled={process.suspended || startingProcess === process.processDefinitionKey}
                          >
                            <Play className="h-3 w-3" />
                            {startingProcess === process.processDefinitionKey ? '...' : 'Démarrer'}
                          </Button>
                          <Link to="/conception/nouveau">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" /> Modifier
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Drawer - Détails processus */}
      {drawerOpen && selectedProcess && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Détails du processus
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Informations générales</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nom</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedProcess.processName || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Description</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right max-w-xs">{selectedProcess.processDescription || '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Créé le</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedProcess.deployedAt ? new Date(selectedProcess.deployedAt).toLocaleDateString('fr-FR') : '–'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statut</span>
                    {selectedProcess.suspended ? (
                      <span className="text-red-600 font-medium">Suspendu</span>
                    ) : (
                      <span className="text-green-600 font-medium">Actif</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Instances</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actives</span>
                    <span className="font-semibold text-green-600">{selectedProcess.activeInstanceCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total</span>
                    <span className="font-semibold text-blue-600">{selectedProcess.instanceCount || 0}</span>
                  </div>
                </div>
              </div>
              {(selectedProcess.processTags || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Mots-clés</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProcess.processTags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleStartProcess(selectedProcess.processDefinitionKey)}
                  disabled={selectedProcess.suspended || startingProcess === selectedProcess.processDefinitionKey}
                >
                  <Play className="h-4 w-4" /> Démarrer une instance
                </Button>
                <Link to="/conception/nouveau">
                  <Button variant="outline">
                    <Edit className="h-4 w-4" /> Modifier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
