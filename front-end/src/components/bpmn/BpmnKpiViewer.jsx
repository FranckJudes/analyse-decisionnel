/**
 * BpmnKpiViewer
 * Affiche un diagramme BPMN avec superposition de KPIs sur chaque nœud :
 *  - couleur de fond selon la performance (vert / orange / rouge)
 *  - badge durée moyenne au-dessus du nœud
 *  - épaisseur des flèches selon le volume
 *  - surlignage bleu pulsant des tâches actives en temps réel
 *
 * Props :
 *   xml          {string}   XML BPMN à afficher
 *   kpiData      {object}   { [elementId]: { avgDuration, count, errorRate, status } }
 *   activeTasks  {string[]} IDs des éléments BPMN actuellement actifs (polling)
 *   onNodeClick  {function} callback(elementId, kpiData)
 */
import React, { useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

// Couleur selon performance
function getColor(kpi) {
  if (!kpi) return null;
  if (kpi.status === 'error' || kpi.errorRate > 0.15) return { fill: '#fef2f2', stroke: '#ef4444' };
  if (kpi.status === 'slow'  || (kpi.avgDuration && kpi.avgDuration > kpi.threshold * 1.2))
    return { fill: '#fffbeb', stroke: '#f59e0b' };
  return { fill: '#f0fdf4', stroke: '#22c55e' };
}

export default function BpmnKpiViewer({ xml, kpiData = {}, activeTasks = [], onNodeClick }) {
  const containerRef = useRef(null);
  const viewerRef    = useRef(null);
  const overlayIdsRef = useRef([]);

  // ── Initialiser le viewer une seule fois ────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = new BpmnViewer({ container: containerRef.current });

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  // ── Importer le XML et appliquer les overlays ───────────────────────────────
  useEffect(() => {
    if (!viewerRef.current || !xml) return;

    const viewer = viewerRef.current;

    viewer.importXML(xml).then(() => {
      viewer.get('canvas').zoom('fit-viewport', 'auto');
      applyOverlays(viewer, kpiData, activeTasks, onNodeClick);
    }).catch((err) => {
      console.error('BpmnKpiViewer: erreur import XML', err);
    });
  }, [xml, kpiData, activeTasks]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 420 }}
      className="bpmn-kpi-viewer rounded-xl overflow-hidden bg-white dark:bg-slate-900"
    />
  );
}

// ── Applique couleurs + badges overlay ─────────────────────────────────────────
function applyOverlays(viewer, kpiData, activeTasks, onNodeClick) {
  const canvas          = viewer.get('canvas');
  const overlays        = viewer.get('overlays');
  const elementRegistry = viewer.get('elementRegistry');

  // Supprimer les anciens overlays
  try { overlays.remove({ type: 'kpi-badge' }); } catch (_) {}
  try { overlays.remove({ type: 'active-task' }); } catch (_) {}

  // Construire un index name → kpi pour matcher les logs simulés (qui utilisent le nom, pas l'ID)
  const kpiByName = {};
  Object.entries(kpiData).forEach(([k, v]) => { kpiByName[k.toLowerCase().trim()] = v; });

  const resolveKpi = (element) => {
    // 1. Chercher par ID exact
    if (kpiData[element.id]) return kpiData[element.id];
    // 2. Chercher par nom de l'élément (cas logs simulés)
    const name = (element.businessObject?.name || '').toLowerCase().trim();
    if (name && kpiByName[name]) return kpiByName[name];
    return null;
  };

  // Colorer les éléments via CSS inline sur les shapes
  elementRegistry.forEach((element) => {
    const kpi = resolveKpi(element);
    if (!kpi) return;

    // ── Coloration du nœud ──────────────────────────────────────────────────
    const colors = getColor(kpi);
    if (colors && (element.type !== 'label') && element.width) {
      try {
        const gfx = canvas.getGraphics(element);
        // Sélectionner le rect ou le polygone principal du shape
        const shape = gfx.querySelector('rect, polygon, circle, path');
        if (shape) {
          shape.style.fill   = colors.fill;
          shape.style.stroke = colors.stroke;
          shape.style.strokeWidth = '2.5px';
        }
      } catch (_) {}
    }

    // ── Badge KPI au-dessus du nœud ─────────────────────────────────────────
    if (element.width && kpi.avgDuration !== undefined) {
      const durationLabel = kpi.avgDuration >= 60
        ? `${(kpi.avgDuration / 60).toFixed(1)}h`
        : `${Math.round(kpi.avgDuration)}min`;

      const countLabel = kpi.count ? ` · ${kpi.count}×` : '';
      const errorLabel = kpi.errorRate ? ` · ⚠ ${(kpi.errorRate * 100).toFixed(0)}%` : '';

      const badgeColor = getColor(kpi);
      const bg  = badgeColor?.stroke ?? '#6366f1';

      overlays.add(element.id, 'kpi-badge', {
        position: { top: -32, left: 0 },
        html: `
          <div style="
            background:${bg};
            color:#fff;
            font-size:10px;
            font-weight:600;
            padding:2px 6px;
            border-radius:4px;
            white-space:nowrap;
            box-shadow:0 1px 4px rgba(0,0,0,.25);
            pointer-events:none;
          ">
            ⏱ ${durationLabel}${countLabel}${errorLabel}
          </div>
        `,
      });
    }
  });

  // ── Épaisseur des flèches selon volume ──────────────────────────────────────
  elementRegistry.forEach((element) => {
    if (element.type !== 'bpmn:SequenceFlow') return;
    const kpi = kpiData[element.id];
    if (!kpi?.count) return;

    try {
      const gfx = canvas.getGraphics(element);
      const path = gfx.querySelector('polyline, path');
      if (path) {
        const thickness = Math.min(6, 1 + Math.log2(kpi.count + 1));
        path.style.strokeWidth = `${thickness}px`;
        path.style.stroke = '#6366f1';
        path.style.opacity = '0.8';
      }
    } catch (_) {}
  });

  // ── Surlignage des tâches actives en temps réel ────────────────────────────
  const activeSet = new Set(activeTasks);
  if (activeSet.size > 0) {
    // Injecter les keyframes CSS si besoin
    const styleId = 'bpmn-active-task-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes bpmn-stroke-pulse {
          0%, 100% { stroke-width: 3px; stroke-opacity: 1; }
          50%       { stroke-width: 5px; stroke-opacity: 0.65; }
        }
        @keyframes bpmn-dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);
    }

    elementRegistry.forEach((element) => {
      if (!activeSet.has(element.id) || !element.width || element.type === 'label') return;

      // Bordure bleue pulsante
      try {
        const gfx = canvas.getGraphics(element);
        const shape = gfx.querySelector('rect, polygon, circle, path');
        if (shape) {
          shape.style.fill        = '#eff6ff';
          shape.style.stroke      = '#3b82f6';
          shape.style.strokeWidth = '3px';
          shape.style.animation   = 'bpmn-stroke-pulse 1.5s ease-in-out infinite';
        }
      } catch (_) {}

      // Badge "En cours" sous le nœud
      overlays.add(element.id, 'active-task', {
        position: { bottom: -22, left: 0 },
        html: `<div style="
          background:#3b82f6;
          color:#fff;
          font-size:10px;
          font-weight:700;
          padding:2px 8px;
          border-radius:12px;
          white-space:nowrap;
          box-shadow:0 1px 6px rgba(59,130,246,.45);
          pointer-events:none;
          display:inline-flex;
          align-items:center;
          gap:5px;
        ">
          <span style="
            width:6px;height:6px;border-radius:50%;
            background:#fff;display:inline-block;
            animation:bpmn-dot-blink 1.5s ease-in-out infinite;
          "></span>
          En cours
        </div>`,
      });
    });
  }

  // ── Clic sur un élément ─────────────────────────────────────────────────────
  if (onNodeClick) {
    viewer.get('eventBus').on('element.click', (event) => {
      const { element } = event;
      const kpi = resolveKpi(element);
      if (kpi) onNodeClick(element.id, kpi, element);
    });
  }
}
