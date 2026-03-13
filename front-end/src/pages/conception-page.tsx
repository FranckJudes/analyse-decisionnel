import React, { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Pagination } from '../components/ui';

const processMocks = [
  {
    name: 'Onboarding client entreprise',
    owner: 'Claire Dupont',
    status: 'En conception',
    sla: 'J+12',
    updatedAt: '13 mars 2026',
  },
  {
    name: 'Validation crédit corporate',
    owner: 'Romain Diallo',
    status: 'Revue conformité',
    sla: 'J+5',
    updatedAt: '10 mars 2026',
  },
  {
    name: 'Gestion incident fournisseur',
    owner: 'Maya Legrand',
    status: 'Automatisé',
    sla: 'H+4',
    updatedAt: '2 mars 2026',
  },
  {
    name: 'Pilotage campagne marketing',
    owner: 'Julien Costa',
    status: 'En simulation',
    sla: 'J+3',
    updatedAt: '28 fév. 2026',
  },
];

export function ConceptionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalItems = processMocks.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems]);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProcesses = useMemo(
    () => processMocks.slice(startIndex, startIndex + pageSize),
    [startIndex]
  );

  return (
    <div className="px-6 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#3c50e0] uppercase">Pilotage BPMN</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Studio de conception</h1>
          <p className="text-slate-500 dark:text-slate-400">Visualise les processus métier et prépare leurs variantes avant exécution.</p>
        </div>
        <Link
          to="/conception/nouveau"
          className="inline-flex items-center justify-center rounded-lg bg-[#3c50e0] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2f3db3]"
        >
          Nouveau processus
        </Link>
      </div>

      <div className="mb-4 rounded-2xl border border-dashed border-slate-200/80 bg-white/40 p-4 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-400">
        {totalItems} processus listés dans l’espace de conception.
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Processus</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SLA cible</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
            {paginatedProcesses.map((process, index) => (
              <tr key={process.name}>
                <td className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {String(startIndex + index + 1).padStart(2, '0')}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 dark:text-white">{process.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">BPMN v2.0</p>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{process.owner}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {process.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{process.sla}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{process.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
