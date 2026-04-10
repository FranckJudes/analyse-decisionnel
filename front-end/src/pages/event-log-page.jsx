/**
 * EventLogPage — ETL & Modèle en étoile
 *
 * Tabs:
 *   1. Import          — Upload CSV / JSON de logs, preview, mapping colonnes
 *   2. Modèle en étoile — Schéma visuel des 4 dimensions + table de faits
 *   3. Logs transformés — Table des événements après ETL
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Upload,
  Database,
  Table,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  Layers,
  Clock,
  Users,
  Activity,
  Tag,
  ArrowRight,
  FileText,
  Play,
  X,
  FileSpreadsheet,
  TrendingUp,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnalyticsService from '../services/analyticsService';
import { useSimulation } from '../context/simulation-context';

// ─── ETL helpers ──────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function buildStarSchema(logs, colMap) {
  const {
    caseId: caseCol,
    activity: actCol,
    timestamp: tsCol,
    actor: actorCol,
    status: statusCol,
  } = colMap;

  const dimTime = {};
  const dimActivity = {};
  const dimActor = {};
  const dimStatus = {};
  const facts = [];

  const instances = {};

  logs.forEach((row, idx) => {
    const caseId = row[caseCol] ?? `CASE-${idx}`;
    const activity = row[actCol] ?? 'Unknown';
    const tsRaw = row[tsCol];
    const ts = tsRaw ? new Date(tsRaw) : new Date();
    const actor = row[actorCol] ?? 'System';
    const status = row[statusCol] ?? 'completed';

    // Dim Temps
    const dateKey = ts.toISOString().slice(0, 10);
    if (!dimTime[dateKey]) {
      dimTime[dateKey] = {
        dateKey,
        year: ts.getFullYear(),
        quarter: `Q${Math.ceil((ts.getMonth() + 1) / 3)}`,
        month: ts.toLocaleString('fr-FR', { month: 'long' }),
        week: `S${Math.ceil(ts.getDate() / 7)}`,
        dayOfWeek: ts.toLocaleString('fr-FR', { weekday: 'long' }),
      };
    }

    // Dim Activité
    if (!dimActivity[activity]) {
      dimActivity[activity] = { activityId: Object.keys(dimActivity).length + 1, name: activity, type: 'task', slaHours: 8 };
    }

    // Dim Acteur
    if (!dimActor[actor]) {
      dimActor[actor] = { actorId: Object.keys(dimActor).length + 1, name: actor, role: 'Utilisateur', department: 'N/A' };
    }

    // Dim Statut
    if (!dimStatus[status]) {
      dimStatus[status] = { statusId: Object.keys(dimStatus).length + 1, code: status, label: status, isError: status === 'error' || status === 'failed' };
    }

    // Calcul durée (compare avec l'événement précédent du même case)
    const prev = instances[caseId];
    const durationMin = prev ? Math.round((ts - prev.ts) / 60000) : 0;
    instances[caseId] = { ts, activity };

    facts.push({
      factId: idx + 1,
      caseId,
      dateKey,
      activityId: dimActivity[activity].activityId,
      actorId: dimActor[actor].actorId,
      statusId: dimStatus[status].statusId,
      durationMin,
      cost: Math.round(durationMin * 0.5),
      isError: dimStatus[status].isError ? 1 : 0,
      timestamp: ts.toISOString(),
    });
  });

  return {
    dimTime: Object.values(dimTime),
    dimActivity: Object.values(dimActivity),
    dimActor: Object.values(dimActor),
    dimStatus: Object.values(dimStatus),
    facts,
  };
}

// ─── Star Schema Visual ───────────────────────────────────────────────────────

const FACT_FIELDS = ['factId', 'caseId', 'dateKey', 'activityId', 'actorId', 'statusId', 'durationMin', 'cost', 'isError'];

const DIM_CONFIGS = [
  {
    key: 'dimTime',
    label: 'Dim_Temps',
    icon: Clock,
    color: 'indigo',
    fields: ['dateKey', 'year', 'quarter', 'month', 'week', 'dayOfWeek'],
    fk: 'dateKey',
    position: 'top',
  },
  {
    key: 'dimActivity',
    label: 'Dim_Activité',
    icon: Activity,
    color: 'emerald',
    fields: ['activityId', 'name', 'type', 'slaHours'],
    fk: 'activityId',
    position: 'right',
  },
  {
    key: 'dimActor',
    label: 'Dim_Acteur',
    icon: Users,
    color: 'violet',
    fields: ['actorId', 'name', 'role', 'department'],
    fk: 'actorId',
    position: 'bottom',
  },
  {
    key: 'dimStatus',
    label: 'Dim_Statut',
    icon: Tag,
    color: 'amber',
    fields: ['statusId', 'code', 'label', 'isError'],
    fk: 'statusId',
    position: 'left',
  },
];

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-700',
    header: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    header: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-700',
    header: 'bg-violet-500',
    text: 'text-violet-700 dark:text-violet-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    header: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
};

function DimTable({ config, count }) {
  const c = colorMap[config.color];
  const Icon = config.icon;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden shadow-sm min-w-[160px]`}>
      <div className={`${c.header} text-white px-3 py-2 flex items-center gap-2`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">{config.label}</span>
        {count !== undefined && (
          <span className="ml-auto text-xs bg-white/20 px-1.5 py-0.5 rounded">{count}</span>
        )}
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {config.fields.map(f => (
          <div key={f} className={`text-[11px] ${f === config.fk ? `font-bold ${c.text}` : 'text-slate-500 dark:text-slate-400'}`}>
            {f === config.fk ? '🔑 ' : '· '}{f}
          </div>
        ))}
      </div>
    </div>
  );
}

function StarSchemaVisual({ schema }) {
  return (
    <div className="relative flex flex-col items-center gap-4 py-4">
      {/* Top dim */}
      <div className="flex justify-center">
        <DimTable config={DIM_CONFIGS[0]} count={schema?.dimTime?.length} />
      </div>

      {/* Middle row: left dim + fact + right dim */}
      <div className="flex items-center gap-6">
        <DimTable config={DIM_CONFIGS[3]} count={schema?.dimStatus?.length} />

        {/* Arrow left */}
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-180" />

        {/* Fact table */}
        <div className="rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden shadow-md min-w-[180px]">
          <div className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-2 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Fait_Exécution</span>
            {schema?.facts && (
              <span className="ml-auto text-xs bg-white/20 px-1.5 py-0.5 rounded">{schema.facts.length}</span>
            )}
          </div>
          <div className="px-3 py-2 space-y-0.5">
            {FACT_FIELDS.map(f => (
              <div key={f} className={`text-[11px] ${
                ['dateKey','activityId','actorId','statusId'].includes(f)
                  ? 'font-bold text-slate-700 dark:text-slate-300'
                  : 'text-slate-400'
              }`}>
                {['dateKey','activityId','actorId','statusId'].includes(f) ? '🔗 ' : '· '}{f}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow right */}
        <ArrowRight className="w-5 h-5 text-slate-400" />

        <DimTable config={DIM_CONFIGS[1]} count={schema?.dimActivity?.length} />
      </div>

      {/* Arrows top/bottom */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-600" />
          <ArrowRight className="w-5 h-5 text-slate-400 -rotate-90" />
        </div>
      </div>

      {/* Bottom dim */}
      <div className="flex justify-center">
        <DimTable config={DIM_CONFIGS[2]} count={schema?.dimActor?.length} />
      </div>

      {/* Top arrow */}
      <div className="absolute top-[calc(50%-80px)] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <ArrowRight className="w-5 h-5 text-slate-400 -rotate-90" />
      </div>
    </div>
  );
}

// ─── Default column mapping ───────────────────────────────────────────────────
const DEFAULT_COL_MAP = {
  caseId: 'case_id',
  activity: 'activity',
  timestamp: 'timestamp',
  actor: 'actor',
  status: 'status',
};

const SAMPLE_CSV = `case_id,activity,timestamp,actor,status
CASE-001,Réception demande,2025-01-10 08:00,Marie Dupont,completed
CASE-001,Validation manager,2025-01-10 14:30,Pierre Martin,completed
CASE-001,Traitement,2025-01-11 09:00,Marie Dupont,completed
CASE-001,Clôture,2025-01-11 16:00,System,completed
CASE-002,Réception demande,2025-01-10 09:00,Sophie Leroy,completed
CASE-002,Validation manager,2025-01-12 10:00,Pierre Martin,slow
CASE-002,Traitement,2025-01-13 11:00,Sophie Leroy,completed
CASE-003,Réception demande,2025-01-11 08:00,Jean Petit,completed
CASE-003,Validation manager,2025-01-11 09:00,Pierre Martin,completed
CASE-003,Traitement,2025-01-11 15:00,Jean Petit,error
CASE-003,Retraitement,2025-01-12 09:00,Jean Petit,completed
CASE-003,Clôture,2025-01-12 16:00,System,completed`;

// ─── Main component ───────────────────────────────────────────────────────────

export function EventLogPage() {
  const navigate = useNavigate();
  const { publishLogs } = useSimulation();
  const [tab, setTab] = useState('import');
  const [rawLogs, setRawLogs] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [colMap, setColMap] = useState(DEFAULT_COL_MAP);
  const [schema, setSchema] = useState(null);
  const [etlStatus, setEtlStatus] = useState(null); // null | 'running' | 'done' | 'error'
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  // Convertit les rawLogs vers le format attendu par SimulationContext
  function buildContextLogs() {
    return rawLogs.map((r, i) => ({
      id: `etl-${i}`,
      case_id: r[colMap.caseId] ?? `CASE-${i}`,
      activity: r[colMap.activity] ?? '—',
      timestamp: r[colMap.timestamp] ?? new Date().toISOString(),
      actor: r[colMap.actor] ?? 'Utilisateur',
      status: r[colMap.status] ?? 'completed',
      duration_min: 0,
      // champs compatibles ProcessMonitor
      taskName: r[colMap.activity] ?? '—',
      durationMs: 0,
      eventType: (r[colMap.status] ?? '').toLowerCase() === 'error' ? 'ERROR' : 'COMPLETE',
    }));
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let data;
        if (file.name.endsWith('.json')) {
          data = JSON.parse(ev.target.result);
          if (!Array.isArray(data)) data = [data];
        } else {
          data = parseCSV(ev.target.result);
        }
        setRawLogs(data);
        const cols = Object.keys(data[0] || {});
        setHeaders(cols);
        // Auto-map
        const autoMap = { ...DEFAULT_COL_MAP };
        const lower = cols.map(c => c.toLowerCase());
        if (lower.some(c => c.includes('case'))) autoMap.caseId = cols[lower.findIndex(c => c.includes('case'))];
        if (lower.some(c => c.includes('activ'))) autoMap.activity = cols[lower.findIndex(c => c.includes('activ'))];
        if (lower.some(c => c.includes('time') || c.includes('date'))) autoMap.timestamp = cols[lower.findIndex(c => c.includes('time') || c.includes('date'))];
        if (lower.some(c => c.includes('actor') || c.includes('user') || c.includes('agent'))) autoMap.actor = cols[lower.findIndex(c => c.includes('actor') || c.includes('user') || c.includes('agent'))];
        if (lower.some(c => c.includes('status') || c.includes('state'))) autoMap.status = cols[lower.findIndex(c => c.includes('status') || c.includes('state'))];
        setColMap(autoMap);
        setSchema(null);
        setEtlStatus(null);
      } catch (err) {
        console.error('Erreur parsing', err);
      }
    };
    reader.readAsText(file);
  }

  function loadSample() {
    const data = parseCSV(SAMPLE_CSV);
    setRawLogs(data);
    setHeaders(Object.keys(data[0]));
    setColMap(DEFAULT_COL_MAP);
    setFileName('sample_event_log.csv');
    setSchema(null);
    setEtlStatus(null);
  }

  function runETL() {
    if (!rawLogs.length) return;
    setEtlStatus('running');
    setTimeout(() => {
      try {
        const result = buildStarSchema(rawLogs, colMap);
        setSchema(result);
        setEtlStatus('done');
        setTab('schema');
      } catch (err) {
        console.error('ETL error', err);
        setEtlStatus('error');
      }
    }, 600);
  }

  function exportFacts() {
    if (!schema?.facts) return;
    const headers = Object.keys(schema.facts[0]).join(',');
    const rows = schema.facts.map(r => Object.values(r).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fait_execution.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const TABS = [
    { id: 'import', label: 'Import & ETL', icon: Upload },
    { id: 'schema', label: 'Modèle en étoile', icon: Database },
    { id: 'logs', label: 'Logs transformés', icon: Table },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Event Logs & ETL</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Importez vos logs de processus, transformez-les et visualisez le modèle en étoile
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {rawLogs.length > 0 && (
            <>
              <button
                onClick={() => {
                  publishLogs(buildContextLogs(), 'etl');
                  navigate({ to: '/advanced-analytics' });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
              >
                <TrendingUp className="w-4 h-4" />
                Analyser
              </button>
              <button
                onClick={() => {
                  publishLogs(buildContextLogs(), 'etl');
                  navigate({ to: '/process-monitor' });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                <Activity className="w-4 h-4" />
                Process Monitor
              </button>
            </>
          )}
          {schema && (
            <button
              onClick={exportFacts}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter faits CSV
            </button>
          )}
          <button
            onClick={() => {
              const tid = toast.loading('Export Excel Power BI en cours…');
              AnalyticsService.exportStarSchemaExcel()
                .then(() => toast.success('Fichier power_bi_star_schema.xlsx téléchargé', { id: tid }))
                .catch((err) => toast.error(`Erreur export: ${err.message}`, { id: tid }));
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporter vers Power BI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.id === 'schema' && schema && (
              <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                {schema.facts.length} faits
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Import & ETL ── */}
      {tab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upload zone */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-400" />
              Source de données
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group"
            >
              <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3 group-hover:text-indigo-400 transition-colors" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {fileName ?? 'Déposer un fichier CSV ou JSON'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Format XES, CSV, JSON acceptés</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.xes"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <button
              onClick={loadSample}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Charger les données d'exemple
            </button>

            {rawLogs.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {rawLogs.length} événements chargés depuis <strong>{fileName}</strong>
              </div>
            )}
          </div>

          {/* Column mapping */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Mapping des colonnes
            </h2>

            <div className="space-y-3">
              {[
                { key: 'caseId', label: 'Identifiant de cas', desc: 'ex. case_id, process_id', required: true },
                { key: 'activity', label: 'Nom d\'activité', desc: 'ex. activity, task_name', required: true },
                { key: 'timestamp', label: 'Horodatage', desc: 'ex. timestamp, start_time', required: true },
                { key: 'actor', label: 'Acteur / Ressource', desc: 'ex. actor, user, agent', required: false },
                { key: 'status', label: 'Statut', desc: 'ex. status, state', required: false },
              ].map(({ key, label, desc, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <select
                    value={colMap[key]}
                    onChange={e => setColMap(prev => ({ ...prev, [key]: e.target.value }))}
                    disabled={!headers.length}
                    className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="">{desc}</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={runETL}
                disabled={!rawLogs.length || etlStatus === 'running'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {etlStatus === 'running' ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" />Transformation en cours…</>
                ) : (
                  <><Play className="w-4 h-4" />Lancer l'ETL</>
                )}
              </button>
            </div>

            {etlStatus === 'done' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4" />
                Modèle en étoile généré avec succès — {schema?.facts?.length} faits
              </div>
            )}
            {etlStatus === 'error' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                Erreur lors de la transformation. Vérifiez le mapping.
              </div>
            )}
          </div>

          {/* Raw preview */}
          {rawLogs.length > 0 && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <Eye className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Aperçu — données brutes</h3>
                <span className="ml-auto text-xs text-slate-400">{rawLogs.length} lignes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      {headers.map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {rawLogs.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        {headers.map(h => (
                          <td key={h} className="px-4 py-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rawLogs.length > 8 && (
                  <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700">
                    … {rawLogs.length - 8} lignes supplémentaires non affichées
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Star Schema ── */}
      {tab === 'schema' && (
        <div className="space-y-6">
          {!schema ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Aucun schéma généré. Importez des données et lancez l'ETL.
              </p>
              <button
                onClick={() => setTab('import')}
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:underline"
              >
                Aller à l'import →
              </button>
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Faits', value: schema.facts.length, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-800', icon: Database },
                  { label: 'Dim_Temps', value: schema.dimTime.length, color: 'text-indigo-700', bg: 'bg-indigo-500', icon: Clock },
                  { label: 'Dim_Activité', value: schema.dimActivity.length, color: 'text-emerald-700', bg: 'bg-emerald-500', icon: Activity },
                  { label: 'Dim_Acteur', value: schema.dimActor.length, color: 'text-violet-700', bg: 'bg-violet-500', icon: Users },
                  { label: 'Dim_Statut', value: schema.dimStatus.length, color: 'text-amber-700', bg: 'bg-amber-500', icon: Tag },
                ].map(stat => (
                  <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center text-white shrink-0`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual star */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Schéma en étoile — Architecture dimensionnelle
                </h2>
                <StarSchemaVisual schema={schema} />
                <p className="text-center text-xs text-slate-400 mt-4">
                  🔑 = clé primaire &nbsp;·&nbsp; 🔗 = clé étrangère
                </p>
              </div>

              {/* Dimension tables preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DIM_CONFIGS.map(cfg => {
                  const rows = schema[cfg.key] ?? [];
                  const c = colorMap[cfg.color];
                  const Icon = cfg.icon;
                  return (
                    <div key={cfg.key} className={`${c.bg} border ${c.border} rounded-xl overflow-hidden shadow-sm`}>
                      <div className={`${c.header} text-white px-4 py-2.5 flex items-center gap-2`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{cfg.label}</span>
                        <span className="ml-auto text-xs bg-white/20 px-1.5 py-0.5 rounded">{rows.length} lignes</span>
                      </div>
                      <div className="overflow-x-auto max-h-48">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/20">
                              {cfg.fields.map(f => (
                                <th key={f} className={`px-3 py-1.5 text-left whitespace-nowrap ${c.text} font-semibold`}>{f}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-700/30">
                            {rows.slice(0, 5).map((row, i) => (
                              <tr key={i} className="hover:bg-white/30 dark:hover:bg-white/5">
                                {cfg.fields.map(f => (
                                  <td key={f} className="px-3 py-1.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{String(row[f] ?? '')}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {rows.length > 5 && (
                          <p className="px-3 py-1.5 text-[10px] text-slate-400">… {rows.length - 5} de plus</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Logs transformés (faits) ── */}
      {tab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {!schema ? (
            <div className="p-12 text-center">
              <Table className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Aucune donnée transformée. Lancez l'ETL d'abord.</p>
              <button onClick={() => setTab('import')} className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:underline">
                Aller à l'import →
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-slate-400" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Table de faits — Fait_Exécution
                  </h3>
                  <span className="text-xs text-slate-400 ml-2">{schema.facts.length} lignes</span>
                </div>
                <button onClick={exportFacts} className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      {FACT_FIELDS.concat(['timestamp']).map(h => (
                        <th key={h} className={`px-4 py-3 text-left font-medium uppercase tracking-wide whitespace-nowrap ${
                          ['dateKey','activityId','actorId','statusId'].includes(h)
                            ? 'text-indigo-500'
                            : 'text-slate-400'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {schema.facts.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        {FACT_FIELDS.concat(['timestamp']).map(h => (
                          <td key={h} className={`px-4 py-2 whitespace-nowrap ${
                            row.isError && h !== 'factId' ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'
                          }`}>
                            {h === 'durationMin' ? `${row[h]} min` : String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {schema.facts.length > 50 && (
                  <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700">
                    … {schema.facts.length - 50} lignes non affichées
                  </p>
                )}
              </div>

              {/* Bandeau d'actions post-ETL */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 rounded-b-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-auto">
                  {schema.facts.length} événements prêts — choisissez votre destination :
                </span>
                <button
                  onClick={() => {
                    publishLogs(buildContextLogs(), 'etl');
                    navigate({ to: '/advanced-analytics' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Analyser les logs
                </button>
                <button
                  onClick={() => {
                    publishLogs(buildContextLogs(), 'etl');
                    navigate({ to: '/process-monitor' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  <Activity className="w-4 h-4" />
                  Process Monitor
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
