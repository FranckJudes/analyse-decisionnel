import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutGrid,
  Zap,
  ShoppingCart,
  FileText,
  Calendar,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface SidebarProps {
  isOpen?: boolean;
}

const menuItems = [
  {
    label: 'Menu',
    items: [
      { label: 'Dashboard', icon: LayoutGrid, path: '/' },
      { label: 'AI Assistant', icon: Zap, path: '/ai-assistant', badge: 'NEW' },
      { label: 'E-commerce', icon: ShoppingCart, path: '/e-commerce', badge: 'NEW' },
      {
        label: 'Task',
        icon: FileText,
        path: '/task/kanban',
        hasChildren: true,
        children: [
          { label: 'List', path: '/task/list', badge: 'PRO' },
          { label: 'Kanban', path: '/task/kanban', badge: 'PRO' },
        ],
      },
      { label: 'Calendar', icon: Calendar, path: '/calendar' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Chat', icon: MessageCircle, path: '/chat' },
      { label: 'Support Ticket', icon: HelpCircle, path: '/support-ticket', badge: 'NEW' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', icon: User, path: '/profile' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

export function Sidebar({ isOpen = true }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Task']);
  const { getSidebarClasses, getTextClasses, getBackgroundClasses, getBorderClasses, getButtonClasses, theme, currentTheme, getHoverClasses } = useThemeClasses();

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className={`w-72 ${getSidebarClasses('flex flex-col h-full overflow-y-auto')}`}>
      <div className="p-6 flex items-center gap-3">
        <div className={`w-8 h-8 ${theme.primary} rounded-md flex items-center justify-center shrink-0`}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className={`text-2xl font-bold tracking-tight ${getTextClasses('default')}`}>
          TailAdmin
        </span>
      </div>

      <nav className="flex-1 px-4 py-4">
        {menuItems.map((group) => (
          <div key={group.label} className="mb-8">
            <h3 className={`px-4 text-xs font-semibold ${getTextClasses('muted')} uppercase tracking-wider mb-4`}>
              {group.label}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  {item.hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg group ${
                          isParentActive(item.path)
                            ? `${theme.secondary} ${theme.primaryText}`
                            : `${getTextClasses('default')} ${getHoverClasses()}`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${getTextClasses('muted')}`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedMenus.includes(item.label) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedMenus.includes(item.label) && item.children && (
                        <ul className="mt-2 ml-12 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                to={child.path}
                                className={`flex items-center justify-between py-2 text-sm ${
                                  isActive(child.path)
                                    ? `font-semibold ${theme.primaryText} ${theme.primaryLight} px-3 rounded-lg -ml-3`
                                    : `${getTextClasses('muted')} hover:${getTextClasses('default')}`
                                }`}
                              >
                                <span>{child.label}</span>
                                {child.badge && (
                                  <span className={`text-[10px] font-bold ${theme.secondary} ${theme.primaryText} px-1.5 rounded`}>
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${
                        isActive(item.path)
                          ? `${theme.secondary} ${theme.primaryText}`
                          : `${getTextClasses('default')} ${getHoverClasses()}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${getTextClasses('muted')}`} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.success} text-white rounded`}>
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
