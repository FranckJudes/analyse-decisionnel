import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Network, BarChart2, Clock, Zap, Users, RefreshCw,
  Home, ChevronRight, TrendingUp, AlertTriangle, Play, FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import toast from 'react-hot-toast';
import AnalyticsService from '../services/analyticsService';

// ─── Sub-tabs ────────────────────────────────────────────────────────────────

function ProcessDiscoveryTab({ data }) {
  if (!data) return <EmptyState label="Exécutez l'analyse pour afficher la découverte de processus." />;
  const metrics = data.metrics || {};
  const fitness = metrics.fitness?.average_trace_fitness ?? 0;
  return (
    <div className="space-y-4">
      {data.petri_net_image && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <img src={`data:image/png;base64,${data.petri_net_image}`} alt="Réseau de Petri" className="w-full" />
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBadge label="Fitness" value={`${(fitness * 100).toFixed(1)}%`} color={fitness > 0.8 ? 'green' : 'orange'} />
        <MetricBadge label="Précision" value={`${((metrics.precision ?? 0) * 100).toFixed(1)}%`} />
        <MetricBadge label="Généralisation" value={`${((metrics.generalization ?? 0) * 100).toFixed(1)}%`} />
        <MetricBadge label="Simplicité" value={`${((metrics.simplicity ?? 0) * 100).toFixed(1)}%`} />
      </div>
    </div>
  );
}

function ProcessVariantsTab({ data }) {
  if (!data) return <EmptyState label="Exécutez l'analyse pour afficher les variantes." />;
  const stats = data.case_statistics || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBadge label="Cas totaux" value={stats.total_cases ?? 0} />
        <MetricBadge label="Durée médiane" value={stats.median_duration ?? 0} />
        <MetricBadge label="Durée min" value={stats.min_duration ?? 0} color="green" />
        <MetricBadge label="Durée max" value={stats.max_duration ?? 0} color="red" />
      </div>
      {(data.variants || []).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Variante', 'Nombre', 'Pourcentage', 'Durée moyenne'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.variants.slice(0, 15).map((v, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400 max-w-xs truncate">{v.variant}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{v.count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${Math.min(100, v.percentage)}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{v.percentage?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{v.averageDuration?.toFixed(2) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BottleneckTab({ data }) {
  if (!data) return <EmptyState label="Exécutez l'analyse pour afficher les goulots d'étranglement." />;
  const severityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
  return (
    <div className="space-y-4">
      {data.sojourn_time_image && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <img src={`data:image/png;base64,${data.sojourn_time_image}`} alt="Temps de séjour" className="w-full" />
        </div>
      )}
      {(data.bottlenecks || []).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Activité', 'Temps de séjour', 'Sévérité'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.bottlenecks.map((b, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{b.activity}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{b.sojourn_time?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {b.severity && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[b.severity] || 'bg-slate-100 text-slate-600'}`}>
                        {b.severity}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PredictionTab({ data }) {
  if (!data) return <EmptyState label="Exécutez l'analyse pour afficher les prédictions de performance." />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricBadge label="Durée actuelle" value={data.current_duration?.toFixed(2) ?? 'N/A'} color="blue" />
        <MetricBadge label="Durée restante prédite" value={data.predicted_remaining_duration?.toFixed(2) ?? 'N/A'} color="purple" />
        <MetricBadge label="Durée totale prédite" value={data.predicted_total_duration?.toFixed(2) ?? 'N/A'} />
        <MetricBadge label="Durée moyenne" value={data.average_duration?.toFixed(2) ?? 'N/A'} />
        <MetricBadge label="Risque de retard" value={data.delay_risk ? 'Oui' : 'Non'} color={data.delay_risk ? 'red' : 'green'} />
        <MetricBadge label="Cas similaires" value={data.similar_cases_count ?? 0} />
      </div>
      {data.comparison_image && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4">
          <img src={`data:image/png;base64,${data.comparison_image}`} alt="Comparaison" className="w-full" />
        </div>
      )}
    </div>
  );
}

function SocialNetworkTab({ data }) {
  if (!data) return <EmptyState label="Exécutez l'analyse pour afficher le réseau social organisationnel." />;
  return (
    <div className="space-y-4">
      {data.social_network_image && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <img src={`data:image/png;base64,${data.social_network_image}`} alt="Réseau social" className="w-full" />
        </div>
      )}
      {(data.roles || []).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Rôles identifiés</h4>
          <div className="flex flex-wrap gap-2">
            {data.roles.map((r, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">{r}</span>
            ))}
          </div>
        </div>
      )}
      {(data.social_network || []).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Source', 'Cible', 'Valeur'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.social_network.slice(0, 20).map((e, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{e.source}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.target}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{e.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function MetricBadge({ label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdvancedAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcessKey, setSelectedProcessKey] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('process-discovery');
  const [analysisData, setAnalysisData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const defs = await AnalyticsService.getProcessDefinitions();
        const normalized = (Array.isArray(defs) ? defs : []).reduce((acc, pd) => {
          const id = String(pd.id || pd.definitionId || pd.key || '');
          const key = String(pd.key || pd.processDefinitionKey || id);
          const name = pd.name || key;
          if (key && !acc.find((x) => x.key === key)) acc.push({ id, key, name });
          return acc;
        }, []);
        setProcessDefinitions(normalized);
        if (normalized.length > 0) setSelectedProcessKey(normalized[0].key);
        else setError('Aucune définition de processus disponible');
      } catch (err) {
        setError(`Erreur de connexion : ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchLogs = async () => {
    if (!selectedProcessKey) return [];
    try {
      const logs = await AnalyticsService.getProcessLogsForAnalytics(
        selectedProcessKey,
        startDate || null,
        endDate || null
      );
      return Array.isArray(logs) ? logs : [];
    } catch {
      return [];
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await fetchLogs();
      if (logs.length === 0) {
        setError("Aucun log d'événement disponible pour l'analyse");
        return;
      }

      let result;
      switch (activeTab) {
        case 'process-discovery':
          result = await AnalyticsService.processDiscovery(logs, 'inductive');
          break;
        case 'process-variants':
          result = await AnalyticsService.processVariants(logs, 10);
          break;
        case 'bottleneck-analysis':
          result = await AnalyticsService.bottleneckAnalysis(logs, 'waiting_time');
          break;
        case 'performance-prediction': {
          const first = logs[0] || {};
          const caseId = first.case_id || first.process_instance_id || first.processInstanceId || first.caseId || null;
          if (!caseId) { setError('Aucun cas disponible pour la prédiction'); return; }
          result = await AnalyticsService.performancePrediction(logs, 'completion_time', { case_id: caseId });
          break;
        }
        case 'social-network-analysis':
          result = await AnalyticsService.socialNetworkAnalysis(logs, 'handover_of_work');
          break;
        default:
          setError("Type d'analyse non reconnu");
          return;
      }
      setAnalysisData((prev) => ({ ...prev, [activeTab]: result }));
    } catch (err) {
      setError(`Erreur lors de l'analyse : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'process-discovery', label: 'Découverte', icon: <Network className="h-4 w-4" /> },
    { id: 'process-variants', label: 'Variantes', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'bottleneck-analysis', label: 'Goulots', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'performance-prediction', label: 'Prédiction', icon: <Zap className="h-4 w-4" /> },
    { id: 'social-network-analysis', label: 'Réseau social', icon: <Users className="h-4 w-4" /> },
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
            <TrendingUp className="h-4 w-4" /> Analyse avancée des processus BPMN
          </span>
        </nav>

        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Analyse avancée des processus BPMN</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Découverte, variantes, goulots, prédiction de performance et analyse du réseau social
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Processus</label>
                <select
                  value={selectedProcessKey || ''}
                  onChange={(e) => { setSelectedProcessKey(e.target.value); setAnalysisData({}); }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {processDefinitions.map((p) => (
                    <option key={p.key} value={p.key}>{p.name || p.key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Début</label>
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setAnalysisData({}); }}
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Fin</label>
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setAnalysisData({}); }}
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <Button variant="primary" onClick={runAnalysis} disabled={!selectedProcessKey || loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {loading ? 'Analyse en cours...' : "Exécuter l'analyse"}
              </Button>
              <button
                onClick={() => {
                  const tid = toast.loading('Export Excel Power BI en cours…');
                  AnalyticsService.exportStarSchemaExcel()
                    .then(() => toast.success('Fichier power_bi_star_schema.xlsx téléchargé', { id: tid }))
                    .catch((err) => toast.error(`Erreur export: ${err.message}`, { id: tid }));
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exporter vers Power BI
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        <Card>
          <div className="px-6 pt-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t)} />
          </div>
          <CardContent>
            {activeTab === 'process-discovery' && <ProcessDiscoveryTab data={analysisData['process-discovery']} />}
            {activeTab === 'process-variants' && <ProcessVariantsTab data={analysisData['process-variants']} />}
            {activeTab === 'bottleneck-analysis' && <BottleneckTab data={analysisData['bottleneck-analysis']} />}
            {activeTab === 'performance-prediction' && <PredictionTab data={analysisData['performance-prediction']} />}
            {activeTab === 'social-network-analysis' && <SocialNetworkTab data={analysisData['social-network-analysis']} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
