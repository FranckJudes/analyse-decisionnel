import React from 'react';
import { Link } from '@tanstack/react-router';
import { Home, ChevronRight, Building2, Users, FileText, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const quickLinks = [
  { label: 'Gestion des processus', description: 'Configurer et déployer vos processus BPMN', to: '/configuration', icon: Settings, color: 'blue' },
  { label: 'Démarrer un processus', description: 'Lancer une nouvelle instance de processus', to: '/process-starter', icon: FileText, color: 'green' },
  { label: 'Utilisateurs & Groupes', description: 'Gérer les comptes et les permissions', to: '/users-groups', icon: Users, color: 'purple' },
  { label: 'Analyse avancée', description: 'Analyser les performances des processus', to: '/advanced-analytics', icon: BarChart3, color: 'orange' },
];

const colors = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
};

export function OfficePage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <Building2 className="h-4 w-4" /> Office
          </span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Office</h1>
              <p className="text-slate-300 text-sm">Espace de travail centralisé</p>
            </div>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed max-w-xl">
            Bienvenue dans votre espace de travail. Accédez rapidement à toutes les fonctionnalités
            de gestion des processus métier, des utilisateurs et des analyses.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Accès rapide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((item) => {
              const c = colors[item.color];
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}>
                  <div className={`rounded-xl border ${c.border} ${c.bg} p-5 hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
                        <Icon className={`h-5 w-5 ${c.icon}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.label}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info card */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Système de gestion BPM</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Plateforme d'analyse décisionnelle et de gestion des processus métier
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
