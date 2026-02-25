import React, { useState } from 'react';
import { X, RotateCcw, Sun, Moon, Check, Save } from 'lucide-react';
import { useCustomizer } from '../../context/customizer-context';

function CustomizerPanel() {
  const {
    isCustomizerOpen,
    setIsCustomizerOpen,
    isDark,
    setIsDark,
    currentTheme,
    sidebarColor,
    setSidebarColor,
    navbarColor,
    setNavbarColor,
    navType,
    setNavType,
    sidebarCollapsed,
    setSidebarCollapsed,
    containerWidth,
    setContainerWidth,
    borderRadius,
    setBorderRadius,
    setGlobalTheme,
    resetToDefault,
    savePreferencesToBackend,
    themes,
    navigationTypes
  } = useCustomizer();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePreferencesToBackend();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isCustomizerOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={() => setIsCustomizerOpen(false)}
      />
      
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customize
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetToDefault}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCustomizerOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Appearance
            </h4>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center">
                {isDark ? <Moon className="w-4 h-4 mr-2 text-indigo-500" /> : <Sun className="w-4 h-4 mr-2 text-yellow-500" />}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isDark ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Navigation Type
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(navigationTypes).map(([key, nav]) => (
                <div
                  key={key}
                  onClick={() => setNavType(key)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    navType === key
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="w-full h-12 bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center relative overflow-hidden">
                    <div className={`text-xs text-gray-500 transition-transform duration-200 ${
                      navType === key ? 'scale-110' : ''
                    } ${key === 'vertical' ? 'rotate-90' : ''}`}>
                      {key === 'vertical' && '|||'}
                      {key === 'horizontal' && '==='}
                      {key === 'combo' && '▦'}
                      {key === 'dual' && '⋮⋮'}
                    </div>
                    {navType === key && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {nav.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {nav.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {(navType === 'vertical' || navType === 'combo') && (
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Sidebar Options
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Collapsed Sidebar
                  </span>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      sidebarCollapsed ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Sidebar Colors
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => setSidebarColor(key)}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    sidebarColor === key
                      ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-full h-8 ${theme.primary} rounded mb-2 transition-all duration-200 ${
                    sidebarColor === key ? 'shadow-md' : ''
                  }`}></div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {theme.name}
                  </p>
                  {sidebarColor === key && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Navbar Colors
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => setNavbarColor(key)}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    navbarColor === key
                      ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-full h-8 ${theme.primary} rounded mb-2 transition-all duration-200 ${
                    navbarColor === key ? 'shadow-md' : ''
                  }`}></div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {theme.name}
                  </p>
                  {navbarColor === key && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Color Themes (Global)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => setGlobalTheme(key)}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    currentTheme === key
                      ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-full h-8 ${theme.primary} rounded mb-2 transition-all duration-200 ${
                    currentTheme === key ? 'shadow-md' : ''
                  }`}></div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {theme.name}
                  </p>
                  {currentTheme === key && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Layout Options
            </h4>
            <div className="space-y-4">
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Container Width
                </p>
                <select 
                  value={containerWidth}
                  onChange={(e) => setContainerWidth(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="full">Full Width</option>
                  <option value="boxed">Boxed</option>
                </select>
              </div>

              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Border Radius
                </p>
                <select 
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="more">More Rounded</option>
                </select>
              </div>

              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <div className={`w-full h-8 bg-gradient-to-r from-purple-400 to-blue-500 ${
                  borderRadius === 'square' ? 'rounded-none' : 
                  borderRadius === 'rounded' ? 'rounded-md' : 'rounded-xl'
                } transition-all duration-300`}></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {containerWidth === 'full' ? 'Full width container' : 'Boxed container'} • {borderRadius} corners
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isSaving
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                }`}
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Les modifications sont appliquées immédiatement. Cliquez sur "Sauvegarder" pour les conserver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomizerPanel;
