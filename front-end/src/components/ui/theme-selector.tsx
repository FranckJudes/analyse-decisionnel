import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check, Sparkles } from 'lucide-react';
import { useCustomizer, ThemeColor } from '../../context/customizer-context';

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
        icon: <Sparkles className="w-3 h-3" />,
      },
      purpleNebula: {
        name: 'Violet Nébuleux',
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        icon: <Sparkles className="w-3 h-3" />,
      },
      greenAurora: {
        name: 'Vert Aurora',
        color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        icon: <Sparkles className="w-3 h-3" />,
      },
      orangeCosmic: {
        name: 'Orange Cosmic',
        color: 'bg-gradient-to-r from-orange-500 to-amber-500',
        icon: <Sparkles className="w-3 h-3" />,
      },
      indigoDream: {
        name: 'Indigo Dream',
        color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
        icon: <Sparkles className="w-3 h-3" />,
      },
      roseQuantum: {
        name: 'Rose Quantum',
        color: 'bg-gradient-to-r from-rose-500 to-fuchsia-500',
        icon: <Sparkles className="w-3 h-3" />,
      },
    },
  },
};

export function ThemeSelector() {
  const { isDark, setIsDark, currentTheme, setGlobalTheme, themes } = useCustomizer();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('classic');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (themeKey: ThemeColor) => {
    setGlobalTheme(themeKey);
  };

  const getCurrentThemeInfo = () => {
    for (const category of Object.values(themeCategories)) {
      if (category.themes[currentTheme as keyof typeof category.themes]) {
        return (category.themes as Record<string, { name: string; color: string; icon?: React.ReactNode }>)[currentTheme];
      }
    }
    return { name: 'Inconnu', color: 'bg-gray-600' };
  };

  const currentThemeInfo = getCurrentThemeInfo();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors relative"
        title={`Thème actuel: ${currentThemeInfo.name}`}
      >
        <Palette className="w-5 h-5" />
        <div
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${currentThemeInfo.color} border-2 border-white dark:border-slate-800`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Personnalisation du thème
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-blue-500" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mode {isDark ? 'sombre' : 'clair'}
                </span>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3c50e0] focus:ring-offset-2 ${
                  isDark ? 'bg-[#3c50e0]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2 mb-4">
              {Object.entries(themeCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeCategory === key
                      ? 'bg-[#3c50e0]/10 text-[#3c50e0] dark:bg-[#3c50e0]/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {themeCategories[activeCategory as keyof typeof themeCategories].name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(themeCategories[activeCategory as keyof typeof themeCategories].themes).map(
                  ([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key as ThemeColor)}
                      className={`group relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        currentTheme === key
                          ? 'border-[#3c50e0] bg-[#3c50e0]/5 dark:bg-[#3c50e0]/10'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${theme.color} shadow-sm flex items-center justify-center text-white`}
                        >
                          {theme.icon}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {theme.name}
                          </div>
                          {themes[key as ThemeColor]?.shadow && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Avec ombre
                            </div>
                          )}
                        </div>
                      </div>
                      {currentTheme === key && (
                        <div className="absolute top-1 right-1">
                          <Check className="w-4 h-4 text-[#3c50e0]" />
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Le thème sera appliqué à toute l'interface
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
