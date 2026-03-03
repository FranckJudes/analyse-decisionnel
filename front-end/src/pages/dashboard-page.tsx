import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  RefreshCw,
  Star,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  BarChart2,
  PieChart,
  Target,
  Award,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { useThemeClasses } from '../hooks/useThemeClasses';

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
            style={{ height: `${(d.value / max) * 100}%`, background: color, opacity: 0.75 + (i / data.length) * 0.25 }}
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

function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let current = 0;
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      {segments.map((seg, i) => {
        const start = (current / total) * 360;
        const end = ((current + seg.value) / total) * 360;
        current += seg.value;
        return <DonutSegment key={i} cx={60} cy={60} r={50} start={start} end={end} color={seg.color} />;
      })}
      <circle cx={60} cy={60} r={30} className="fill-white dark:fill-slate-800" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const kpiCards = [
  {
    title: 'Total Revenue',
    value: '$84,540',
    change: '+12.5%',
    positive: true,
    icon: DollarSign,
    sparkline: [40, 55, 48, 70, 62, 80, 75, 95, 88, 104],
    color: '#6366f1',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconBg: 'bg-indigo-500',
  },
  {
    title: 'Total Users',
    value: '28,451',
    change: '+8.2%',
    positive: true,
    icon: Users,
    sparkline: [30, 42, 58, 50, 65, 72, 68, 80, 85, 90],
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-500',
  },
  {
    title: 'Total Orders',
    value: '5,231',
    change: '-3.1%',
    positive: false,
    icon: ShoppingCart,
    sparkline: [60, 55, 68, 52, 48, 45, 50, 43, 40, 38],
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconBg: 'bg-amber-500',
  },
  {
    title: 'Page Views',
    value: '1.2M',
    change: '+22.4%',
    positive: true,
    icon: Eye,
    sparkline: [20, 35, 40, 55, 60, 75, 80, 88, 95, 100],
    color: '#8b5cf6',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    iconBg: 'bg-violet-500',
  },
];

const revenueData = [
  { label: 'Jan', value: 32 },
  { label: 'Fév', value: 58 },
  { label: 'Mar', value: 45 },
  { label: 'Avr', value: 70 },
  { label: 'Mai', value: 62 },
  { label: 'Jun', value: 88 },
  { label: 'Jul', value: 75 },
  { label: 'Aoû', value: 96 },
  { label: 'Sep', value: 84 },
  { label: 'Oct', value: 110 },
  { label: 'Nov', value: 98 },
  { label: 'Déc', value: 125 },
];

const trafficSources = [
  { label: 'Organique', value: 45, color: '#6366f1' },
  { label: 'Direct', value: 28, color: '#10b981' },
  { label: 'Social', value: 18, color: '#f59e0b' },
  { label: 'Référent', value: 9, color: '#8b5cf6' },
];

const recentOrders = [
  { id: '#ORD-4521', customer: 'Alice Martin', product: 'MacBook Pro 16"', amount: '$2,499', status: 'completed', date: 'Il y a 2h' },
  { id: '#ORD-4520', customer: 'Bernard Dupont', product: 'AirPods Max', amount: '$549', status: 'pending', date: 'Il y a 4h' },
  { id: '#ORD-4519', customer: 'Camille Leroy', product: 'iPhone 15 Pro', amount: '$1,199', status: 'processing', date: 'Il y a 5h' },
  { id: '#ORD-4518', customer: 'David Chen', product: 'iPad Pro 12.9"', amount: '$1,099', status: 'completed', date: 'Hier' },
  { id: '#ORD-4517', customer: 'Emma Wilson', product: 'Apple Watch S9', amount: '$429', status: 'cancelled', date: 'Hier' },
  { id: '#ORD-4516', customer: 'François Petit', product: 'Mac Studio', amount: '$1,999', status: 'completed', date: 'Il y a 2j' },
];

const activities = [
  { icon: Users, color: 'bg-indigo-500', text: 'Nouvel utilisateur inscrit : Sophie Mercier', time: 'Il y a 3 min' },
  { icon: ShoppingCart, color: 'bg-emerald-500', text: 'Commande #ORD-4521 marquée comme complétée', time: 'Il y a 12 min' },
  { icon: Star, color: 'bg-amber-500', text: 'Avis 5 étoiles reçu sur MacBook Pro', time: 'Il y a 35 min' },
  { icon: Target, color: 'bg-violet-500', text: 'Objectif mensuel atteint à 87%', time: 'Il y a 1h' },
  { icon: Award, color: 'bg-rose-500', text: 'Badge "Top Vendeur" décerné à Alice Martin', time: 'Il y a 2h' },
  { icon: Zap, color: 'bg-cyan-500', text: 'Alerte : pic de trafic sur la page Accueil', time: 'Il y a 3h' },
];

const topProducts = [
  { name: 'MacBook Pro 16"', sales: 342, revenue: '$854,058', growth: 12 },
  { name: 'iPhone 15 Pro', sales: 891, revenue: '$1,068,309', growth: 24 },
  { name: 'iPad Pro 12.9"', sales: 214, revenue: '$235,186', growth: -5 },
  { name: 'AirPods Max', sales: 567, revenue: '$311,283', growth: 18 },
  { name: 'Apple Watch S9', sales: 428, revenue: '$183,612', growth: 9 },
];

const deviceStats = [
  { icon: Monitor, label: 'Desktop', value: 52, color: 'bg-indigo-500' },
  { icon: Smartphone, label: 'Mobile', value: 35, color: 'bg-emerald-500' },
  { icon: Tablet, label: 'Tablet', value: 13, color: 'bg-amber-500' },
];

const statusConfig = {
  completed: { label: 'Complété', icon: CheckCircle, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
  pending: { label: 'En attente', icon: Clock, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  processing: { label: 'En cours', icon: RefreshCw, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  cancelled: { label: 'Annulé', icon: XCircle, cls: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { theme } = useThemeClasses();
  const [activeTab, setActiveTab] = useState<'revenue' | 'traffic'>('revenue');

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Bienvenue ! Voici un aperçu de votre activité.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ${theme.primary} rounded-lg transition-all hover:opacity-90 shadow-sm`}>
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((kpi) => (
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

      {/* ── Row 2: Revenue chart + Traffic sources ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue / Traffic chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Aperçu des performances</h3>
              <p className="text-xs text-slate-400 mt-0.5">Janvier – Décembre 2025</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5">
              {(['revenue', 'traffic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === t
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                >
                  {t === 'revenue' ? 'Revenus' : 'Trafic'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-between gap-1 mb-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'revenue' ? '$84,540' : '1.2M'}
            </span>
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +{activeTab === 'revenue' ? '12.5' : '22.4'}% vs an dernier
            </span>
          </div>
          <BarChart
            data={revenueData}
            color={activeTab === 'revenue' ? '#6366f1' : '#10b981'}
          />
        </div>

        {/* Traffic sources donut */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Sources de trafic</h3>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={trafficSources.map(s => ({ value: s.value, color: s.color, label: s.label }))}
            />
          </div>
          <div className="space-y-2.5">
            {trafficSources.map((src) => (
              <div key={src.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: src.color }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{src.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${src.value}%`, background: src.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-7 text-right">{src.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent orders + Activity + Device stats ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Orders table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Commandes récentes</h3>
            </div>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Commande', 'Client', 'Produit', 'Montant', 'Statut', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {recentOrders.map((order) => {
                  const s = statusConfig[order.status as keyof typeof statusConfig];
                  const SIcon = s.icon;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{order.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{order.customer}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">{order.product}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">{order.amount}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                          <SIcon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{order.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Activité récente</h3>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-1">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`w-8 h-8 ${act.color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  <act.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{act.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Top products + Device stats + Quick goals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top products */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Top produits</h3>
            </div>
            <span className="text-xs text-slate-400">Ce mois</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-4">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sales} ventes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.revenue}</p>
                  <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${p.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {p.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {p.growth >= 0 ? '+' : ''}{p.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device stats + Quick objectives */}
        <div className="space-y-5">
          {/* Device breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Appareils</h3>
            </div>
            <div className="space-y-3">
              {deviceStats.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 ${d.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                      <d.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full transition-all duration-700`} style={{ width: `${d.value}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right">{d.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick goals */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Objectifs du mois</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Revenus', current: 84540, target: 100000, color: 'bg-indigo-500' },
                { label: 'Nouveaux clients', current: 312, target: 400, color: 'bg-emerald-500' },
                { label: 'Commandes', current: 5231, target: 6000, color: 'bg-amber-500' },
              ].map((goal) => {
                const pct = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={goal.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{goal.label}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${goal.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-400">
                        {typeof goal.current === 'number' && goal.current > 1000
                          ? `$${(goal.current / 1000).toFixed(1)}k`
                          : goal.current}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        / {typeof goal.target === 'number' && goal.target > 1000
                          ? `$${(goal.target / 1000).toFixed(0)}k`
                          : goal.target}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
