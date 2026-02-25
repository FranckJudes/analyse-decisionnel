import React, { useState, createContext, useContext, useEffect } from 'react';
import { getCustomizerPreferences, saveCustomizerPreferences } from '../services/userService';
import { useAuth } from './AuthProvider';

const showToast = (message, type = 'success') => {
  console.log(`[${type}] ${message}`);
};

const CustomizerContext = createContext();

const themes = {
  blue: {
    name: 'Blue',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryLight: 'bg-blue-50',
    primaryText: 'text-blue-600',
    secondary: 'bg-blue-100',
    secondaryHover: 'hover:bg-blue-200',
    accent: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-blue-200',
    borderHover: 'hover:border-blue-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-blue-600',
    sidebarHover: 'hover:bg-blue-700',
    navbar: 'bg-blue-600',
    navbarHover: 'hover:bg-blue-700'
  },
  purple: {
    name: 'Purple',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    primaryLight: 'bg-purple-50',
    primaryText: 'text-purple-600',
    secondary: 'bg-purple-100',
    secondaryHover: 'hover:bg-purple-200',
    accent: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-purple-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-purple-200',
    borderHover: 'hover:border-purple-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-purple-600',
    sidebarHover: 'hover:bg-purple-700',
    navbar: 'bg-purple-600',
    navbarHover: 'hover:bg-purple-700'
  },
  green: {
    name: 'Green',
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    primaryLight: 'bg-green-50',
    primaryText: 'text-green-600',
    secondary: 'bg-green-100',
    secondaryHover: 'hover:bg-green-200',
    accent: 'bg-green-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-green-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-green-200',
    borderHover: 'hover:border-green-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-green-600',
    sidebarHover: 'hover:bg-green-700',
    navbar: 'bg-green-600',
    navbarHover: 'hover:bg-green-700'
  },
  red: {
    name: 'Red',
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    primaryLight: 'bg-red-50',
    primaryText: 'text-red-600',
    secondary: 'bg-red-100',
    secondaryHover: 'hover:bg-red-200',
    accent: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-red-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-red-200',
    borderHover: 'hover:border-red-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-red-600',
    sidebarHover: 'hover:bg-red-700',
    navbar: 'bg-red-600',
    navbarHover: 'hover:bg-red-700'
  },
  orange: {
    name: 'Orange',
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryLight: 'bg-orange-50',
    primaryText: 'text-orange-600',
    secondary: 'bg-orange-100',
    secondaryHover: 'hover:bg-orange-200',
    accent: 'bg-orange-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-orange-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-orange-200',
    borderHover: 'hover:border-orange-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-orange-600',
    sidebarHover: 'hover:bg-orange-700',
    navbar: 'bg-orange-600',
    navbarHover: 'hover:bg-orange-700'
  },
  indigo: {
    name: 'Indigo',
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    primaryLight: 'bg-indigo-50',
    primaryText: 'text-indigo-600',
    secondary: 'bg-indigo-100',
    secondaryHover: 'hover:bg-indigo-200',
    accent: 'bg-indigo-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-indigo-200',
    borderHover: 'hover:border-indigo-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-indigo-600',
    sidebarHover: 'hover:bg-indigo-700',
    navbar: 'bg-indigo-600',
    navbarHover: 'hover:bg-indigo-700'
  },
  blueFloat: {
    name: 'Bleu Flottant',
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    primaryHover: 'hover:from-blue-600 hover:to-cyan-600',
    primaryLight: 'bg-gradient-to-r from-blue-50 to-cyan-50',
    primaryText: 'text-blue-600',
    secondary: 'bg-gradient-to-r from-blue-100 to-cyan-100',
    secondaryHover: 'hover:from-blue-200 hover:to-cyan-200',
    accent: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-blue-200',
    borderHover: 'hover:border-cyan-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800',
    sidebarHover: 'hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900',
    navbar: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    navbarHover: 'hover:from-blue-700 hover:to-cyan-700',
    shadow: 'shadow-lg shadow-blue-500/20'
  },
  purpleNebula: {
    name: 'Violet Nébuleux',
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500',
    primaryHover: 'hover:from-purple-600 hover:to-pink-600',
    primaryLight: 'bg-gradient-to-r from-purple-50 to-pink-50',
    primaryText: 'text-purple-600',
    secondary: 'bg-gradient-to-r from-purple-100 to-pink-100',
    secondaryHover: 'hover:from-purple-200 hover:to-pink-200',
    accent: 'bg-gradient-to-r from-purple-400 to-pink-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gradient-to-r from-purple-400 to-pink-400',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-purple-200',
    borderHover: 'hover:border-pink-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-gradient-to-b from-purple-700 via-purple-800 to-pink-900',
    sidebarHover: 'hover:from-purple-800 hover:via-purple-900 hover:to-pink-950',
    navbar: 'bg-gradient-to-r from-purple-600 to-pink-600',
    navbarHover: 'hover:from-purple-700 hover:to-pink-700',
    shadow: 'shadow-xl shadow-purple-500/30'
  },
  greenAurora: {
    name: 'Vert Aurora',
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    primaryHover: 'hover:from-emerald-600 hover:to-teal-600',
    primaryLight: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    primaryText: 'text-emerald-600',
    secondary: 'bg-gradient-to-r from-emerald-100 to-teal-100',
    secondaryHover: 'hover:from-emerald-200 hover:to-teal-200',
    accent: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-emerald-200',
    borderHover: 'hover:border-teal-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-gradient-to-b from-emerald-600 via-teal-700 to-cyan-900',
    sidebarHover: 'hover:from-emerald-700 hover:via-teal-800 hover:to-cyan-950',
    navbar: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    navbarHover: 'hover:from-emerald-700 hover:to-teal-700',
    shadow: 'shadow-lg shadow-emerald-500/25'
  },
  orangeCosmic: {
    name: 'Orange Cosmic',
    primary: 'bg-gradient-to-r from-orange-500 to-amber-500',
    primaryHover: 'hover:from-orange-600 hover:to-amber-600',
    primaryLight: 'bg-gradient-to-r from-orange-50 to-amber-50',
    primaryText: 'text-orange-600',
    secondary: 'bg-gradient-to-r from-orange-100 to-amber-100',
    secondaryHover: 'hover:from-orange-200 hover:to-amber-200',
    accent: 'bg-gradient-to-r from-orange-400 to-amber-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gradient-to-r from-orange-400 to-amber-400',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-orange-200',
    borderHover: 'hover:border-amber-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-gradient-to-b from-orange-600 via-amber-700 to-red-800',
    sidebarHover: 'hover:from-orange-700 hover:via-amber-800 hover:to-red-900',
    navbar: 'bg-gradient-to-r from-orange-600 to-amber-600',
    navbarHover: 'hover:from-orange-700 hover:to-amber-700',
    shadow: 'shadow-xl shadow-orange-500/30'
  },
  green: {
    name: 'Indigo Dream',
    primary: 'bg-gradient-to-r from-indigo-500 to-blue-600',
    primaryHover: 'hover:from-indigo-600 hover:to-blue-700',
    primaryLight: 'bg-gradient-to-r from-indigo-50 to-blue-50',
    primaryText: 'text-indigo-600',
    secondary: 'bg-gradient-to-r from-indigo-100 to-blue-100',
    secondaryHover: 'hover:from-indigo-200 hover:to-blue-200',
    accent: 'bg-gradient-to-r from-indigo-400 to-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gradient-to-r from-indigo-400 to-blue-500',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-indigo-200',
    borderHover: 'hover:border-blue-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-gradient-to-b from-indigo-700 via-indigo-800 to-purple-900',
    sidebarHover: 'hover:from-indigo-800 hover:via-indigo-900 hover:to-purple-950',
    navbar: 'bg-gradient-to-r from-indigo-600 to-blue-600',
    navbarHover: 'hover:from-indigo-700 hover:to-blue-700',
    shadow: 'shadow-2xl shadow-indigo-500/40'
  },
  roseQuantum: {
    name: 'Rose Quantum',
    primary: 'bg-gradient-to-r from-rose-500 to-fuchsia-500',
    primaryHover: 'hover:from-rose-600 hover:to-fuchsia-600',
    primaryLight: 'bg-gradient-to-r from-rose-50 to-fuchsia-50',
    primaryText: 'text-rose-600',
    secondary: 'bg-gradient-to-r from-rose-100 to-fuchsia-100',
    secondaryHover: 'hover:from-rose-200 hover:to-fuchsia-200',
    accent: 'bg-gradient-to-r from-rose-400 to-fuchsia-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gradient-to-r from-rose-400 to-fuchsia-400',
    surface: 'bg-white',
    surfaceDark: 'bg-gray-800',
    border: 'border-rose-200',
    borderHover: 'hover:border-fuchsia-300',
    text: 'text-gray-900',
    textDark: 'text-white',
    textMuted: 'text-gray-500',
    textMutedDark: 'text-gray-400',
    sidebar: 'bg-gradient-to-b from-rose-700 via-fuchsia-800 to-pink-900',
    sidebarHover: 'hover:from-rose-800 hover:via-fuchsia-900 hover:to-pink-950',
    navbar: 'bg-gradient-to-r from-rose-600 to-fuchsia-600',
    navbarHover: 'hover:from-rose-700 hover:to-fuchsia-700',
    shadow: 'shadow-xl shadow-rose-500/35'
  }
};

const navigationTypes = {
  vertical: {
    name: 'Vertical',
    description: 'Sidebar navigation on the left'
  },
  horizontal: {
    name: 'Horizontal',
    description: 'Top navigation bar'
  },
  combo: {
    name: 'Combo',
    description: 'Both sidebar and top nav'
  },
  dual: {
    name: 'Dual nav',
    description: 'Collapsible dual navigation'
  }
};

function CustomizerProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('green');
  const [sidebarColor, setSidebarColor] = useState('green');
  const [navbarColor, setNavbarColor] = useState('green');
  const [navType, setNavType] = useState('vertical');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [containerWidth, setContainerWidth] = useState('full');
  const [borderRadius, setBorderRadius] = useState('rounded');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingPreferences(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        setIsLoadingPreferences(true);
        const response = await getCustomizerPreferences();
        
        if (response.success && response.preferences) {
          const settings = response.preferences;
          setIsDark(settings.isDark || false);
          setCurrentTheme(settings.theme || 'green');
          setSidebarColor(settings.sidebarColor || settings.theme || 'green');
          setNavbarColor(settings.navbarColor || settings.theme || 'green');
          setNavType(settings.navType || 'vertical');
          setSidebarCollapsed(settings.sidebarCollapsed || false);
          setContainerWidth(settings.containerWidth || 'full');
          setBorderRadius(settings.borderRadius || 'rounded');
        } else {
          const saved = localStorage.getItem('customizer-settings');
          if (saved) {
            const settings = JSON.parse(saved);
            setIsDark(settings.isDark || false);
            setCurrentTheme(settings.theme || 'green');
            setSidebarColor(settings.sidebarColor || settings.theme || 'green');
            setNavbarColor(settings.navbarColor || settings.theme || 'green');
            setNavType(settings.navType || 'vertical');
            setSidebarCollapsed(settings.sidebarCollapsed || false);
            setContainerWidth(settings.containerWidth || 'full');
            setBorderRadius(settings.borderRadius || 'rounded');
          }
        }
      } catch {
        const saved = localStorage.getItem('customizer-settings');
        if (saved) {
          const settings = JSON.parse(saved);
          setIsDark(settings.isDark || false);
          setCurrentTheme(settings.theme || 'green');
          setSidebarColor(settings.sidebarColor || settings.theme || 'green');
          setNavbarColor(settings.navbarColor || settings.theme || 'green');
          setNavType(settings.navType || 'vertical');
          setSidebarCollapsed(settings.sidebarCollapsed || false);
          setContainerWidth(settings.containerWidth || 'full');
          setBorderRadius(settings.borderRadius || 'rounded');
        }
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const settings = {
      isDark,
      theme: currentTheme,
      sidebarColor,
      navbarColor,
      navType,
      sidebarCollapsed,
      containerWidth,
      borderRadius
    };
    localStorage.setItem('customizer-settings', JSON.stringify(settings));
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const root = document.documentElement;
    root.classList.remove('container-full', 'container-boxed');
    root.classList.add(`container-${containerWidth}`);
    root.classList.remove('radius-rounded', 'radius-square', 'radius-more');
    root.classList.add(`radius-${borderRadius}`);
  }, [isDark, currentTheme, sidebarColor, navbarColor, navType, sidebarCollapsed, containerWidth, borderRadius]);

  const resetToDefault = async () => {
    setIsDark(false);
    setCurrentTheme('purple');
    setSidebarColor('purple');
    setNavbarColor('purple');
    setNavType('vertical');
    setSidebarCollapsed(false);
    setContainerWidth('full');
    setBorderRadius('rounded');
    localStorage.removeItem('customizer-settings');
    
    try {
      await savePreferencesToBackend();
    } catch {
      // Handle error silently
    }
  };

  const setGlobalTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    setSidebarColor(themeKey);
    setNavbarColor(themeKey);
  };

  const savePreferencesToBackend = async () => {
    try {
      const settings = {
        isDark,
        theme: currentTheme,
        sidebarColor,
        navbarColor,
        navType,
        sidebarCollapsed,
        containerWidth,
        borderRadius
      };
      
      const response = await saveCustomizerPreferences(settings);
      if (response.success) {
        showToast.success('Préférences sauvegardées avec succès');
        return true;
      } else {
        showToast.error('Erreur lors de la sauvegarde');
        return false;
      }
    } catch {
      showToast.error('Erreur lors de la sauvegarde des préférences');
      return false;
    }
  };

  return (
    <CustomizerContext.Provider value={{ 
      isDark, setIsDark,
      currentTheme, setCurrentTheme,
      sidebarColor, setSidebarColor,
      navbarColor, setNavbarColor,
      navType, setNavType,
      isCustomizerOpen, setIsCustomizerOpen,
      sidebarCollapsed, setSidebarCollapsed,
      containerWidth, setContainerWidth,
      borderRadius, setBorderRadius,
      theme: themes[currentTheme],
      sidebarTheme: themes[sidebarColor],
      navbarTheme: themes[navbarColor],
      setGlobalTheme,
      resetToDefault,
      savePreferencesToBackend,
      isLoadingPreferences,
      themes,
      navigationTypes
    }}>
      {children}
    </CustomizerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomizer() {
  return useContext(CustomizerContext);
}

export default CustomizerProvider;
