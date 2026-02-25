import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, Bell, Menu, ChevronDown, User, Settings, LogOut, Palette } from 'lucide-react';
import { useCustomizer, ThemeColor } from '../../context/customizer-context';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface HeaderProps {
  onMenuClick?: () => void;
}

const themeCategories = {
  classic: {
    name: 'Classiques',
    themes: {
      blue: { name: 'Bleu', color: 'bg-blue-600' },
      purple: { name: 'Violet', color: 'bg-purple-600' },
      green: { name: 'Vert', color: 'bg-green-600' },
      red: { name: 'Rouge', color: 'bg-red-600' },
      orange: { name: 'Orange', color: 'bg-orange-600' },
      indigo: { name: 'Indigo', color: 'bg-indigo-600' },
    },
  },
  gradient: {
    name: 'Dégradés',
    themes: {
      blueFloat: {
        name: 'Bleu Flottant',
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      },
      purpleNebula: {
        name: 'Violet Nébuleux',
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      },
      greenAurora: {
        name: 'Vert Aurora',
        color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      },
      orangeCosmic: {
        name: 'Orange Cosmic',
        color: 'bg-gradient-to-r from-orange-500 to-amber-500',
      },
      indigoDream: {
        name: 'Indigo Dream',
        color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
      },
      roseQuantum: {
        name: 'Rose Quantum',
        color: 'bg-gradient-to-r from-rose-500 to-fuchsia-500',
      },
    },
  },
};

const profileMenuItems = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Header({ onMenuClick }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const customizerRef = useRef<HTMLDivElement>(null);
  
  const { isDark, setIsDark, currentTheme, setGlobalTheme } = useCustomizer();
  const { getNavbarClasses, getTextClasses, getBackgroundClasses, getBorderClasses, theme } = useThemeClasses();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (customizerRef.current && !customizerRef.current.contains(event.target as Node)) {
        setCustomizerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (path: string) => {
    setProfileOpen(false);
  };

  const handleSignOut = () => {
    setProfileOpen(false);
    window.location.href = '/login';
  };

  const getCurrentThemeInfo = () => {
    for (const category of Object.values(themeCategories)) {
      if (category.themes[currentTheme as keyof typeof category.themes]) {
        return (category.themes as Record<string, { name: string; color: string }>)[currentTheme];
      }
    }
    return { name: 'Bleu', color: 'bg-blue-600' };
  };

  const currentThemeInfo = getCurrentThemeInfo();

  return (
    <header className={`h-16 ${getNavbarClasses('flex items-center justify-between px-8 shrink-0')}`}>
      <div className="flex items-center gap-6 w-1/2">
        <button
          className={`${getTextClasses('muted')} hover:${getTextClasses('default')} lg:hidden`}
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className={`w-5 h-5 ${getTextClasses('muted')}`} />
          </span>
          <input
            className={`w-full pl-10 pr-12 py-2 ${getBackgroundClasses('muted')} ${getBorderClasses()} ${getTextClasses('default')} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-${theme.primary?.split('-')[1] || 'blue'}-500`}
            placeholder="Search or type command..."
            type="text"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className={`text-[10px] font-semibold ${getTextClasses('muted')} ${getBorderClasses()} rounded px-1.5 py-0.5`}>
              ⌘ K
            </span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2" ref={customizerRef}>
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className={`p-2 ${getTextClasses('muted')} hover:${getBackgroundClasses('muted')} rounded-lg transition-colors relative`}
            title={`Thème: ${currentThemeInfo.name}`}
          >
            <Palette className="w-5 h-5" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${currentThemeInfo.color} border-2 border-white dark:border-slate-800`} />
          </button>

          {customizerOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isDark ? '🌙 Sombre' : '☀️ Clair'}
                  </span>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDark ? 'bg-[#3c50e0]' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto">
                {Object.entries(themeCategories).map(([catKey, category]) => (
                  <div key={catKey} className="mb-3">
                    <p className="text-xs font-medium text-slate-400 uppercase mb-2">{category.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(category.themes).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => setGlobalTheme(key as ThemeColor)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            currentTheme === key
                              ? 'border-[#3c50e0] bg-[#3c50e0]/5'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-full h-6 rounded-full ${theme.color} mb-1`} />
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
        </button>
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700" ref={profileRef}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
              Musharof
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">UX Designer</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <img
                alt="Profile"
                className="w-9 h-9 rounded-full bg-slate-200 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw1JykhpFTDU3cllq0Kc91yvGWhOF19E8xjzVydiUk4ew0xTD8b0n5YZVkWNo-QNmeUgr1yCfFPh5QM6CWV0vCzVF3dd6nNPXiVxZ7L_r_EbfJXK1J_9lSahNKs6z3T-Iwc0_5G9xYdRJYRaHTsuzzupkDI0_8kEoL_4V6CNiaTDkfQVjdo27Cp_wvnwJGTmn6UiADbXc9nO5DQhgKfFbtUF9wsF3Oxsej2lTw4IBeuIH-tYXx8dE9LmvtTasybyBivP7Eai7m7jg"
              />
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Musharof</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">musharof@example.com</p>
                </div>
                <div className="py-1">
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => handleMenuClick(item.path)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
