import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Activity,
  BarChart2,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Layers,
  GitBranch,
  Zap,
  Target,
  Users,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { Link } from '@tanstack/react-router';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ─── Simple bar chart ─────────────────────────────────────────────────────────
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{ height: `${(d.value / max) * 100}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }}
          />
          <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut chart SVG ─────────────────────────────────────────────────────────
function DonutSegment({ cx, cy, r, start, end, color }: {
  cx: number; cy: number; r: number; start: number; end: number; color: string;
}) {
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(toRad(start));
  const y1 = cy + r * Math.sin(toRad(start));
  const x2 = cx + r * Math.cos(toRad(end));
  const y2 = cy + r * Math.sin(toRad(end));
  const large = end - start > 180 ? 1 : 0;
  return (
    <path
      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
      fill={color}
    />
  );
}

function DonutChart({ segments, centerLabel }: {
  segments: { value: number; color: string; label: string }[];
  centerLabel?: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let current = 0;
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        {segments.map((seg, i) => {
          const start = (current / total) * 360;
          const end = ((current + seg.value) / total) * 360;
          current += seg.value;
          return <DonutSegment key={i} cx={60} cy={60} r={50} start={start} end={end} color={seg.color} />;
        })}
        <circle cx={60} cy={60} r={30} className="fill-white dark:fill-slate-800" />
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-800 dark:text-white">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Static demo data (process-oriented) ────────────────────────────────────

const kpiCards = [
  {
    title: 'Instances actives',
    value: '1 284',
    change: '+9.3%',
    positive: true,
    icon: Layers,
    sparkline: [30, 42, 38, 55, 60, 72, 68, 80, 85, 92],
    color: '#6366f1',
    iconBg: 'bg-indigo-500',
  },
  {
    title: 'Taux de conformité',
    value: '94.7%',
    change: '+2.1 pts',
    positive: true,
    icon: CheckCircle,
    sparkline: [88, 90, 89, 91, 92, 93, 91, 94, 95, 95],
    color: '#10b981',
    iconBg: 'bg-emerald-500',
  },
  {
    title: 'Temps de cycle moyen',
    value: '3.2 j',
    change: '-0.4 j',
    positive: true,
    icon: Clock,
    sparkline: [4.2, 4.0, 3.9, 3.8, 3.7, 3.5, 3.6, 3.4, 3.3, 3.2],
    color: '#f59e0b',
    iconBg: 'bg-amber-500',
  },
  {
    title: "Taux d'erreur",
    value: '5.3%',
    change: '-1.8 pts',
    positive: true,
    icon: XCircle,
    sparkline: [9, 8.5, 8, 7.5, 7, 7.2, 6.5, 6, 5.8, 5.3],
    color: '#ef4444',
    iconBg: 'bg-red-500',
  },
];

const cycleTrend = [
  { label: 'Jan', value: 4.2 },
  { label: 'Fév', value: 4.0 },
  { label: 'Mar', value: 3.9 },
  { label: 'Avr', value: 3.8 },
  { label: 'Mai', value: 3.5 },
  { label: 'Jun', value: 3.6 },
  { label: 'Jul', value: 3.4 },
  { label: 'Aoû', value: 3.2 },
  { label: 'Sep', value: 3.1 },
  { label: 'Oct', value: 3.2 },
  { label: 'Nov', value: 3.0 },
  { label: 'Déc', value: 2.9 },
];

const volumeTrend = [
  { label: 'Jan', value: 980 },
  { label: 'Fév', value: 1050 },
  { label: 'Mar', value: 1100 },
  { label: 'Avr', value: 1200 },
  { label: 'Mai', value: 1150 },
  { label: 'Jun', value: 1280 },
  { label: 'Jul', value: 1190 },
  { label: 'Aoû', value: 1284 },
  { label: 'Sep', value: 1310 },
  { label: 'Oct', value: 1350 },
  { label: 'Nov', value: 1290 },
  { label: 'Déc', value: 1400 },
];

const conformitySegments = [
  { label: 'Conforme', value: 947, color: '#10b981' },
  { label: 'Déviation mineure', value: 38, color: '#f59e0b' },
  { label: 'Non-conforme', value: 15, color: '#ef4444' },
];

const recentInstances = [
  { id: 'PI-4821', process: 'Onboarding client', actor: 'Marie Dubois', duration: '1j 4h', status: 'completed', started: 'Il y a 2h' },
  { id: 'PI-4820', process: 'Validation commande', actor: 'Jean Bernard', duration: '0j 6h', status: 'active', started: 'Il y a 5h' },
  { id: 'PI-4819', process: 'Traitement réclamation', actor: 'Sophie Martin', duration: '4j 2h', status: 'slow', started: 'Il y a 4j' },
  { id: 'PI-4818', process: 'Approbation budget', actor: 'Pierre Leroy', duration: '2j 8h', status: 'completed', started: 'Hier' },
  { id: 'PI-4817', process: 'Validation fournisseur', actor: 'Claire Petit', duration: '—', status: 'error', started: 'Il y a 3j' },
  { id: 'PI-4816', process: 'Onboarding client', actor: 'Thomas Roux', duration: '1j 1h', status: 'completed', started: 'Il y a 2j' },
];

const bottleneckActivities = [
  { name: 'Validation managériale', avgDuration: 18.4, sla: 8, overSla: true, count: 124, errorRate: 3.2 },
  { name: 'Contrôle qualité', avgDuration: 12.1, sla: 6, overSla: true, count: 89, errorRate: 7.8 },
  { name: 'Signature électronique', avgDuration: 6.8, sla: 4, overSla: true, count: 310, errorRate: 1.1 },
  { name: 'Vérification conformité', avgDuration: 4.2, sla: 6, overSla: false, count: 267, errorRate: 4.5 },
  { name: 'Notification client', avgDuration: 0.3, sla: 1, overSla: false, count: 891, errorRate: 0.2 },
];

const processHealth = [
  { name: 'Onboarding client', instances: 312, conformity: 97, cycleTime: 1.8, trend: 1 },
  { name: 'Traitement réclamation', instances: 88, conformity: 82, cycleTime: 5.4, trend: -1 },
  { name: 'Validation commande', instances: 445, conformity: 99, cycleTime: 0.4, trend: 1 },
  { name: 'Approbation budget', instances: 67, conformity: 91, cycleTime: 3.1, trend: 0 },
  { name: 'Gestion fournisseur', instances: 42, conformity: 88, cycleTime: 7.2, trend: -1 },
];

const recentAlerts = [
  { icon: AlertTriangle, color: 'bg-red-500', text: 'Processus "Traitement réclamation" : SLA dépassé sur 14 instances', time: 'Il y a 12 min' },
  { icon: Activity, color: 'bg-amber-500', text: 'Pic de volume détecté : +38% sur "Validation commande"', time: 'Il y a 1h' },
  { icon: GitBranch, color: 'bg-indigo-500', text: 'Nouveau variant découvert sur "Onboarding client" (variant #7)', time: 'Il y a 2h' },
  { icon: Users, color: 'bg-emerald-500', text: 'Acteur "Marie Dubois" : charge de travail à 95%', time: 'Il y a 3h' },
  { icon: Zap, color: 'bg-violet-500', text: 'Déploiement BPMN v2.4 "Approbation budget" effectué', time: 'Il y a 5h' },
  { icon: Target, color: 'bg-cyan-500', text: 'Objectif conformité Q4 atteint : 94.7% (cible 93%)', time: 'Hier' },
];

const statusConfig = {
  completed: { label: 'Terminé', icon: CheckCircle, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
  active: { label: 'En cours', icon: RefreshCw, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  slow: { label: 'Lent', icon: Clock, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  error: { label: 'Erreur', icon: XCircle, cls: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { theme } = useThemeClasses();
  const [activeTab, setActiveTab] = useState<'cycle' | 'volume'>('cycle');
  const printRef = useRef<HTMLDivElement>(null);

  // ── Real data from API ──
  const [liveInstances, setLiveInstances]     = useState<any[]>([]);
  const [liveProcesses, setLiveProcesses]     = useState<any[]>([]);
  const [dataLoaded,    setDataLoaded]         = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [instRes, procRes] = await Promise.all([
          fetch(`${API_URL}/api/process-engine/my-process-instances`, { credentials: 'include' }),
          fetch(`${API_URL}/api/process-engine/my-deployed-processes`, { credentials: 'include' }),
        ]);
        const instData = await instRes.json();
        const procData = await procRes.json();
        const instances: any[] = Array.isArray(instData?.data) ? instData.data
          : Array.isArray(instData) ? instData : [];
        const processes: any[] = Array.isArray(procData?.data) ? procData.data
          : Array.isArray(procData) ? procData : [];
        setLiveInstances(instances);
        setLiveProcesses(processes);
        setDataLoaded(true);
      } catch {
        setDataLoaded(true); // fallback to static data
      }
    };
    load();
  }, []);

  // Computed KPIs from real data
  const totalInst      = liveInstances.length;
  const activeInst     = liveInstances.filter(i => !i.endTime && i.state !== 'COMPLETED').length;
  const completedInst  = liveInstances.filter(i => !!i.endTime || i.state === 'COMPLETED').length;
  const completionRate = totalInst > 0 ? ((completedInst / totalInst) * 100).toFixed(1) : null;
  const durations      = liveInstances.filter(i => i.durationInMillis).map(i => Number(i.durationInMillis));
  const avgDurationMs  = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  const avgDurationDays = avgDurationMs ? (avgDurationMs / 86_400_000).toFixed(1) : null;

  // Real KPI cards (override static values when data loaded)
  const liveKpiCards = kpiCards.map(k => {
    if (!dataLoaded || totalInst === 0) return k;
    if (k.title === 'Instances actives')
      return { ...k, value: activeInst.toLocaleString('fr-FR') };
    if (k.title === 'Taux de conformité' && completionRate)
      return { ...k, value: `${completionRate}%` };
    if (k.title === 'Temps de cycle moyen' && avgDurationDays)
      return { ...k, value: `${avgDurationDays} j` };
    return k;
  });

  // Real recent instances for the table
  const liveRecentInstances = liveInstances.slice(0, 6).map(i => ({
    id: String(i.processInstanceId ?? i.id ?? '—').slice(0, 8).toUpperCase(),
    process: i.processName ?? i.processDefinitionKey ?? '—',
    actor: i.startUserId ?? '—',
    duration: i.durationInMillis
      ? `${(i.durationInMillis / 3_600_000).toFixed(1)}h`
      : i.endTime ? '—' : 'En cours',
    status: i.endTime || i.state === 'COMPLETED' ? 'completed'
      : i.state === 'SUSPENDED' ? 'error'
      : 'active',
    started: i.startTime
      ? new Date(i.startTime).toLocaleDateString('fr-FR')
      : '—',
  }));

  const displayInstances = liveRecentInstances.length > 0 ? liveRecentInstances : recentInstances;
  const displayProcessHealth = liveProcesses.length > 0
    ? liveProcesses.slice(0, 5).map(p => ({
        name: p.processName ?? p.processDefinitionKey ?? '—',
        instances: liveInstances.filter(i => i.processDefinitionKey === (p.processDefinitionKey ?? p.key)).length,
        conformity: 100,
        cycleTime: 0,
        trend: 0,
      }))
    : processHealth;

  function handleExportPdf() {
    const style = document.createElement('style');
    style.id = '__pdf_print_style';
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #__dashboard_print { display: block !important; position: static !important; overflow: visible !important; }
        #__dashboard_print * { overflow: visible !important; }
        .no-print { display: none !important; }
        @page { size: A4 landscape; margin: 12mm; }
      }
    `;
    document.head.appendChild(style);
    if (printRef.current) printRef.current.id = '__dashboard_print';
    window.print();
    document.head.removeChild(style);
    if (printRef.current) printRef.current.removeAttribute('id');
  }

  return (
    <div ref={printRef} className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tableau de bord BI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Supervision en temps réel des processus métier · Avril 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/process-monitor"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Suivi BPMN
          </Link>
          <button
            onClick={handleExportPdf}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ${theme.primary} rounded-lg transition-all hover:opacity-90 shadow-sm no-print`}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {liveKpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${kpi.iconBg} rounded-xl flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <Sparkline data={kpi.sparkline} color={kpi.color} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{kpi.title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {kpi.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {kpi.change} ce mois
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Trend chart + Conformity donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Trend chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Tendances des processus</h3>
              <p className="text-xs text-slate-400 mt-0.5">Janvier – Décembre 2025</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5">
              {(['cycle', 'volume'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === t
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {t === 'cycle' ? 'Cycle time' : 'Volume'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-between gap-1 mb-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'cycle' ? '3.2 jours' : '1 284 instances'}
            </span>
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {activeTab === 'cycle' ? '-10% vs an dernier' : '+31% vs an dernier'}
            </span>
          </div>
          <BarChart
            data={activeTab === 'cycle' ? cycleTrend : volumeTrend}
            color={activeTab === 'cycle' ? '#6366f1' : '#10b981'}
          />
        </div>

        {/* Conformity donut */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Conformité BPMN</h3>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <DonutChart segments={conformitySegments} centerLabel="94.7%" />
          </div>
          <div className="space-y-2.5">
            {conformitySegments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${(seg.value / conformitySegments.reduce((a, s) => a + s.value, 0)) * 100}%`,
                      background: seg.color
                    }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right">{seg.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent instances + Alerts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent instances table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Instances récentes</h3>
            </div>
            <Link to="/process-monitor" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Voir BPMN
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['ID', 'Processus', 'Acteur', 'Durée', 'Statut', 'Démarré'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {displayInstances.map((inst) => {
                  const s = statusConfig[inst.status as keyof typeof statusConfig];
                  const SIcon = s.icon;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{inst.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[140px] truncate">{inst.process}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{inst.actor}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{inst.duration}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                          <SIcon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{inst.started}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert feed */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Alertes & événements</h3>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-1">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`w-8 h-8 ${alert.color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  <alert.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{alert.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Bottlenecks + Process health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bottleneck activities */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Activités goulots d'étranglement</h3>
            </div>
            <Link to="/advanced-analytics" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Analyse complète
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {bottleneckActivities.map((act) => (
              <div key={act.name} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${act.overSla ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{act.name}</p>
                    <p className="text-xs text-slate-400">{act.count} exécutions · {act.errorRate}% erreurs</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={`text-sm font-semibold ${act.overSla ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {act.avgDuration}h moy.
                  </p>
                  <p className="text-xs text-slate-400">SLA : {act.sla}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process health + summary */}
        <div className="space-y-5">
          {/* Process performance table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Santé des processus</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {displayProcessHealth.map((p) => {
                const TrendIcon = p.trend > 0 ? TrendingUp : p.trend < 0 ? TrendingDown : Activity;
                const trendColor = p.trend > 0 ? 'text-emerald-500' : p.trend < 0 ? 'text-red-500' : 'text-slate-400';
                return (
                  <div key={p.name} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.instances} inst. · {p.cycleTime}j</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${p.conformity >= 95 ? 'text-emerald-600' : p.conformity >= 88 ? 'text-amber-600' : 'text-red-500'}`}>
                          {p.conformity}%
                        </p>
                      </div>
                      <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick access */}
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-2">Accès rapide</p>
            <div className="space-y-2">
              <Link to="/process-monitor" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                <Activity className="w-4 h-4" />
                Suivi BPMN interactif
              </Link>
              <Link to="/advanced-analytics" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                <BarChart2 className="w-4 h-4" />
                Analyse avancée PM4Py
              </Link>
              <Link to="/history" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                <Layers className="w-4 h-4" />
                Event logs & audit
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
