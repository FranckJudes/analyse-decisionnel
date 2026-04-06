import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Link as LinkIcon,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useCustomizer } from '../../context/customizer-context';
import { cn } from '../../lib/cn';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavigationItem {
  label: string;
  path?: string;
  badge?: string;
  description?: string;
  icon: LucideIcon;
  children?: Array<{ label: string; path: string; badge?: string }>;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const workspaceNavigation: NavigationGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', path: '/', icon: BarChart3 },
      { label: 'Tâches', path: '/task/kanban', icon: FileText },
      { label: 'Conception', path: '/conception', icon: Building2 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Utilisateurs', path: '/users', icon: Users },
      { label: 'Suivi des processus', path: '/process-monitor', icon: Activity },
      { label: 'Event Logs & ETL', path: '/event-logs', icon: Zap },
      { label: 'Simulation', path: '/simulation', icon: Target },
      { label: 'Analyse avancée', path: '/advanced-analytics', icon: TrendingUp },
    ],
  },
];

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Tâches']);
  const {
    theme,
    getTextClasses,
    getHoverClasses,
    getBorderClasses,
  } = useThemeClasses();
  const { sidebarCollapsed, setSidebarCollapsed } = useCustomizer();

  const effectiveCollapsed = sidebarCollapsed && !isMobileOpen;

  const isActive = (path?: string) => (path ? location.pathname === path : false);
  const isParentActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some((child) => location.pathname.startsWith(child.path));
    }
    return item.path ? location.pathname.startsWith(item.path) : false;
  };

const insightHighlights = [
  { label: 'Conformité BPMN', value: '98%', trend: '+3 pts', icon: Activity },
  { label: 'Processus surveillés', value: '47', trend: '+5 flux', icon: Sparkles },
  { label: 'Décisions automatisées', value: '268 / jour', icon: Target },
];

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((entry) => entry !== label) : [...prev, label]
    );
  };

  const handleNavigate = () => {
    if (onMobileClose) onMobileClose();
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const active = isActive(item.path) || isParentActive(item);
    const baseClasses = cn(
      'relative flex w-full items-center rounded-lg px-2.5 py-1.5 text-[13px] transition',
      effectiveCollapsed ? 'justify-center' : 'gap-3'
    );

    const interactiveClasses = cn(
      baseClasses,
      active
        ? cn(
            'bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15'
          )
        : cn('text-slate-500 dark:text-slate-200', getHoverClasses('hover:bg-white/20 dark:hover:bg-white/5'))
    );

    const renderInner = () => (
      <>
        <div className={cn('flex items-center gap-3', effectiveCollapsed && 'justify-center')}>
          <div className="flex h-8 w-8 items-center justify-center text-slate-500 dark:text-slate-200">
            <item.icon className="h-4 w-4" />
          </div>
          {!effectiveCollapsed && (
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-medium text-slate-900 dark:text-white">{item.label}</span>
                {item.description && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-300">
                {item.badge && (
                  <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-500 dark:border-white/20 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
                {item.children && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      expandedMenus.includes(item.label) ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );

    return (
      <li key={item.label}>
        {item.children ? (
          <button type="button" className={interactiveClasses} onClick={() => toggleMenu(item.label)}>
            {renderInner()}
          </button>
        ) : (
          <Link to={item.path || '/'} onClick={handleNavigate} className={interactiveClasses}>
            {renderInner()}
          </Link>
        )}

        {!effectiveCollapsed && item.children && expandedMenus.includes(item.label) && (
          <ul className="mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-sm dark:border-white/5 dark:bg-white/5">
            {item.children.map((child) => (
              <li key={child.label}>
                <Link
                  to={child.path}
                  onClick={handleNavigate}
                  className={cn(
                    'group flex items-center justify-between rounded-md px-2 py-0.5 text-[13px] transition',
                    isActive(child.path)
                      ? cn('bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white', 'font-semibold')
                      : cn('text-slate-500', 'hover:text-slate-900 dark:hover:text-white')
                  )}
                >
                  <span>{child.label}</span>
                  {child.badge && (
                    <span className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/20 dark:text-slate-200">
                      {child.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const renderSidebarPanel = (compact: boolean, variant: 'desktop' | 'mobile') => (
    <div className="flex h-full w-full flex-col">
      <div
        className={cn(
          'flex h-full flex-col rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-lg dark:border-white/5 dark:bg-slate-900/70 dark:text-white'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white/10">
              <Zap className="h-5 w-5" />
            </div>
            {!compact && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">ProcessIntel</p>
                <p className="text-lg font-semibold">Decision Studio</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-white/20 dark:text-white lg:flex"
            >
              {compact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            {variant === 'mobile' && (
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-white/20 dark:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {!compact && (
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>Espace • Sprint Q2</span>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {workspaceNavigation.map((group) => (
            <div key={group.label} className="mb-6">
              {!compact && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1.5">{group.items.map(renderNavigationItem)}</ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'relative hidden h-full overflow-hidden lg:flex',
          effectiveCollapsed ? 'w-20' : 'w-64',
          'transition-[width] duration-300'
        )}
      >
        {renderSidebarPanel(effectiveCollapsed, 'desktop')}
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          'transition-opacity duration-300'
        )}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onMobileClose} />
        <div className="relative ml-auto flex h-full w-72 max-w-full">
          {renderSidebarPanel(false, 'mobile')}
        </div>
      </div>
    </>
  );
}
