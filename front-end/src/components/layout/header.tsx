import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { useCustomizer } from '../../context/customizer-context';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { ThemeSelector } from '../ui/theme-selector';
import { cn } from '../../lib/cn';

interface HeaderProps {
  onMenuClick?: () => void;
}

const profileMenuItems = [
  { label: 'Profil', icon: User, path: '/profile' },
  { label: 'Paramètres', icon: Settings, path: '/settings' },
];

export function Header({ onMenuClick }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isDark, setIsDark } = useCustomizer();
  const { getNavbarClasses, getTextClasses, getBackgroundClasses, getBorderClasses } = useThemeClasses();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setProfileOpen(false);
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-1 bg-transparent px-4 py-1.5 lg:px-5">
      <div
        className={cn(
          'flex min-h-[48px] items-center justify-between rounded-2xl border border-white/40 bg-white/85 px-3 py-1 text-slate-900 shadow-[0_5px_24px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 dark:text-white',
          'transition-colors'
        )}
      >
        <div className="flex flex-1 items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent bg-slate-100 text-slate-600 transition hover:border-slate-200 hover:text-slate-900 dark:bg-white/10 dark:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden flex-1 max-w-xl rounded-2xl bg-white/80 p-0.5 text-sm shadow-sm ring-1 ring-white/60 backdrop-blur lg:flex dark:bg-slate-900/40 dark:ring-white/10">
            <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-white/90 px-2.5 py-0.5 dark:bg-slate-900/50">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
                placeholder="Rechercher un flux BPMN, un indicateur, une décision..."
                type="text"
              />
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-white/20 dark:text-slate-300">
                ⌘ K
              </span>
            </div>
            <div className="flex items-center gap-1 px-1">
              <button className="flex items-center gap-1 rounded-2xl px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                Process Mining
              </button>
              <button className="flex items-center gap-1 rounded-2xl px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-300">
                <Plus className="h-3.5 w-3.5" />
                Nouveau modèle
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5" ref={profileRef}>
          <div className="hidden items-center gap-1.5 rounded-2xl border border-white/50 bg-white/70 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white lg:flex">
            <span>Mode</span>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition',
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white shadow transition',
                  isDark ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="hidden lg:block">
            <ThemeSelector />
          </div>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-white/50 bg-white/80 text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-1.5 py-0.5 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 rounded-2xl px-1 py-0.5 text-left"
            >
              <div className="hidden text-right text-xs font-medium text-slate-500 dark:text-slate-300 lg:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Musharof</p>
                <p>UX • Sprint Nova</p>
              </div>
              <div className="relative">
                <img
                  className="h-8 w-8 rounded-2xl object-cover shadow-inner"
                  src="https://i.pravatar.cc/120?img=7"
                  alt="Avatar"
                />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <div className="absolute right-4 top-full mt-3 w-60 rounded-2xl border border-slate-100 bg-white/95 p-3 text-sm shadow-2xl dark:border-white/10 dark:bg-slate-900">
                <div className="mb-3 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Clara V. · Chief Process Officer</p>
                  <p className="text-xs text-slate-500">processintel@bpm-suite.com</p>
                </div>
                <div className="space-y-1">
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn('flex items-center justify-between rounded-2xl px-3.5 py-0.5 text-[11px] font-semibold tracking-wide', getNavbarClasses('bg-transparent text-white'))}>
        <div className="flex items-center gap-1.5 text-white/80">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-white">Programme BPM Horizon</span>
          <span>Journaux traités · 3.4M</span>
        </div>
        <div className="hidden gap-4 text-white/70 sm:flex">
          <span>Conformité moyenne · 96%</span>
          <span>Décisions auto · 312/j</span>
          <span>Incidents ouverts · 4</span>
        </div>
      </div>
    </header>
  );
}
