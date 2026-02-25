import { useCustomizer } from '../context/customizer-context';

export function useThemeClasses() {
  const { theme, sidebarTheme, navbarTheme, isDark, currentTheme } = useCustomizer();

  const getButtonClasses = (variant = 'primary', size = 'md', custom = '') => {
    const base = {
      sm: 'px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200',
      md: 'px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200',
      lg: 'px-6 py-3 text-base rounded-lg font-medium transition-all duration-200'
    };

    const variants = {
      primary: `${theme.primary} ${theme.primaryHover} text-white ${theme.shadow || ''}`,
      secondary: `${theme.secondary} ${theme.secondaryHover} ${theme.primaryText}`,
      outline: `border ${theme.border} ${theme.text || 'text-gray-900'} ${theme.borderHover} bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800`,
      ghost: `${theme.text || 'text-gray-900'} bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800`,
      success: 'bg-green-600 hover:bg-green-700 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      error: 'bg-red-600 hover:bg-red-700 text-white',
    };

    return `${base[size]} ${variants[variant]} ${custom}`.trim();
  };

  const getCardClasses = (variant = 'default', custom = '') => {
    const variants = {
      default: `${isDark ? theme.surfaceDark : theme.surface} ${theme.border || (isDark ? 'border-gray-700' : 'border-gray-200')} border ${theme.shadow || ''}`,
      elevated: `${isDark ? theme.surfaceDark : theme.surface} ${theme.border || (isDark ? 'border-gray-700' : 'border-gray-200')} border shadow-lg`,
      outlined: `bg-transparent ${theme.border} border-2`,
      filled: `${theme.secondary}`
    };

    return `${variants[variant]} rounded-lg ${custom}`.trim();
  };

  const getInputClasses = (variant = 'default', custom = '') => {
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const variants = {
      default: `border ${theme.border || (isDark ? 'border-gray-600' : 'border-gray-300')} ${isDark ? theme.surfaceDark : theme.surface} ${textColor} ${theme.borderHover} focus:border-${getThemeColorPrimary()}-500 focus:ring-${getThemeColorPrimary()}-500/20`,
      filled: `${isDark ? theme.surfaceDark : theme.surface} border-0 ${textColor} focus:ring-2 focus:ring-${getThemeColorPrimary()}-500/20`,
    };

    return `${variants[variant]} rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${custom}`.trim();
  };

  const getBadgeClasses = (variant = 'default', custom = '') => {
    const variants = {
      default: `${theme.secondary} ${theme.primaryText}`,
      primary: `${theme.primary} text-white`,
      success: isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
      warning: isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      error: isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
    };

    return `${variants[variant]} px-2.5 py-0.5 text-xs rounded-full font-medium ${custom}`.trim();
  };

  const getContrastTextColor = (bgClass) => {
    if (!bgClass) return isDark ? 'text-white' : 'text-gray-900';
    
    const darkKeywords = ['dark', 'gradient-to-b', 'gradient-to-r', 'purple-', 'indigo-', 'rose-', 'blue-', 'emerald-', 'cyan-', 'teal-', 'pink-', 'fuchsia-', 'orange-', 'amber-'];
    const isGradientBg = bgClass.includes('gradient');
    const isDarkBg = darkKeywords.some(keyword => bgClass.includes(keyword)) || isGradientBg;
    
    if (isDarkBg || isDark) {
      return 'text-white';
    }
    return 'text-gray-900';
  };

  const getTextClasses = (type = 'default', custom = '') => {
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const mutedColor = isDark ? 'text-gray-300' : 'text-gray-500';
    
    const variants = {
      default: textColor,
      muted: mutedColor,
      primary: theme.primaryText || (isDark ? 'text-green-300' : 'text-green-600'),
      inverse: 'text-white',
      success: isDark ? 'text-green-400' : 'text-green-600',
      warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
      error: isDark ? 'text-red-400' : 'text-red-600',
    };

    return `${variants[type]} ${custom}`.trim();
  };

  const getBackgroundClasses = (type = 'default', custom = '') => {
    const variants = {
      default: isDark ? (theme.surfaceDark || 'bg-gray-800') : (theme.surface || 'bg-white'),
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      muted: isDark ? 'bg-gray-900' : 'bg-gray-50',
      border: theme.border || (isDark ? 'border-gray-700' : 'border-gray-200'),
      transparent: 'bg-transparent'
    };

    return `${variants[type]} ${custom}`.trim();
  };

  const getNavbarClasses = (custom = '') => {
    const textColor = getContrastTextColor(navbarTheme.navbar);
    return `${navbarTheme.navbar} ${navbarTheme.navbarHover} ${textColor} ${custom}`.trim();
  };

  const getSidebarClasses = (custom = '') => {
    const textColor = getContrastTextColor(sidebarTheme.sidebar);
    return `${sidebarTheme.sidebar} ${sidebarTheme.sidebarHover} ${textColor} ${custom}`.trim();
  };

  const getBorderClasses = (custom = '') => {
    return `${theme.border || (isDark ? 'border-gray-700' : 'border-gray-200')} ${custom}`.trim();
  };

  const getHoverClasses = (custom = '') => {
    return `${theme.secondaryHover} ${custom}`.trim();
  };

  const getThemeColorPrimary = () => {
    const colorMap = {
      blue: 'blue',
      purple: 'purple',
      green: 'green',
      red: 'red',
      orange: 'orange',
      indigo: 'indigo',
      blueFloat: 'blue',
      purpleNebula: 'purple',
      greenAurora: 'emerald',
      orangeCosmic: 'orange',
      indigoDream: 'indigo',
      roseQuantum: 'rose'
    };
    return colorMap[currentTheme] || 'blue';
  };

  return {
    theme,
    sidebarTheme,
    navbarTheme,
    isDark,
    currentTheme,
    getButtonClasses,
    getCardClasses,
    getInputClasses,
    getBadgeClasses,
    getTextClasses,
    getBackgroundClasses,
    getNavbarClasses,
    getSidebarClasses,
    getBorderClasses,
    getHoverClasses,
    getThemeColorPrimary
  };
}

export default useThemeClasses;
