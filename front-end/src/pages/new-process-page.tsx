import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { FormWizard } from '../components/forms/form-wizard';
import { Button, Input, Select } from '../components/ui';
import { Step2Model, type Step2ModelHandles, type Step2SharedData } from '../components/process/step2-model';
import ConceptionService from '../services/conceptionService';
import UsersAdminService from '../services/usersAdminService';
import toast from 'react-hot-toast';

interface InfoData {
  category: string;
  board: string;
  instructions: string;
  deliverable: string;
}

interface HabilitationFormState {
  interestedEnabled: boolean;
  interestedUser: string | null;
  entityEnabled: boolean;
  entity: string | null;
  groupEnabled: boolean;
  group: string | null;
  assignOwner: boolean;
  owner: string | null;
  requireCheckpoint: boolean;
  checkpointLabel: string;
  allowReturn: boolean;
}

interface NotificationsFormState {
  notifyOnCreation: boolean;
  alertEscalade: boolean;
  reminders: string[];
  sensitivity: 'public' | 'confidential';
}

interface PlanificationFormState {
  allDay: boolean;
  durationValue: string;
  durationUnit: string;
  criticality: string;
  priority: string;
  historyEnabled: boolean;
  kpis: Record<string, boolean>;
  actions: Record<string, boolean>;
}

interface ResourceFormState {
  attachmentsEnabled: boolean;
  selectedNode: string | null;
  nodeType: 'folder' | 'document' | null;
  securityLevel: string;
  externalTools: string;
  linkToTask: string;
  businessRule: boolean;
  formResource: boolean;
  commonActions: Record<string, boolean>;
  documentActions: Record<string, boolean>;
}

const fakeUsers = [
  { id: 'u1', name: 'Nina Robert', role: 'Risk Lead' },
  { id: 'u2', name: 'Ibrahim Ndaye', role: 'Ops Manager' },
  { id: 'u3', name: 'Lou-Anne Dias', role: 'Quality Analyst' },
];

const fakeEntities = [
  { id: 'entity-risk', name: 'Direction Risques' },
  { id: 'entity-ops', name: 'Tribu Opérations' },
  { id: 'entity-kpi', name: 'Cellule KPI' },
];

const fakeGroups = [
  { id: 'grp-tiger', name: 'Squad Tiger' },
  { id: 'grp-ops', name: 'Ops Shift A' },
  { id: 'grp-risk', name: 'Risk Review Board' },
];

const reminderPresets = [
  { id: 'minutesBefore', label: '15 min avant' },
  { id: 'oneHourBefore', label: '1h avant' },
  { id: 'oneDayBefore', label: '1 jour avant' },
  { id: 'oneWeekBefore', label: '1 semaine avant' },
];

const categoryOptions = [
  { value: 'administrative', label: 'Administratif' },
  { value: 'technical', label: 'Technique' },
  { value: 'financial', label: 'Finance' },
  { value: 'hr', label: 'Ressources humaines' },
];

const fakeRepositoryNodes = [
  { id: 'folder-typologies', label: 'Dossier Typologies', type: 'folder' as const },
  { id: 'doc-audit', label: 'Audit conformité v5.pdf', type: 'document' as const },
  { id: 'doc-guide', label: 'Guide onboarding.docx', type: 'document' as const },
  { id: 'folder-templates', label: 'Templates Camunda', type: 'folder' as const },
];

const modelingOptions = [
  { value: 'blank', label: 'Diagramme vierge' },
  { value: 'import', label: 'Importer un BPMN' },
  { value: 'template', label: 'Partir d’un template' },
];

const engineOptions = [
  { value: 'camunda', label: 'Camunda 8' },
  { value: 'zeebe', label: 'Zeebe Cloud' },
  { value: 'n8n', label: 'n8n Orchestrator' },
];

export function NewProcessPage() {
  const navigate = useNavigate();
  const step2Ref = useRef<Step2ModelHandles>(null);
  const [step2SharedData, setStep2SharedData] = useState<Step2SharedData>({});

  // Step 1 — champs contrôlés
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');

  // Utilisateurs réels depuis le backend
  const [backendUsers, setBackendUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  useEffect(() => {
    UsersAdminService.getAllUsers()
      .then((data: any[]) => {
        const normalized = (Array.isArray(data) ? data : []).map((u: any) => ({
          id:   String(u.id),
          name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username ?? u.email ?? String(u.id)),
          role: u.role ?? 'USER',
        }));
        setBackendUsers(normalized);
      })
      .catch(() => { /* backend non dispo → liste vide */ });
  }, []);
  const [bpmnXml, setBpmnXml] = useState<string | null>(null);
  const [bpmnData, setBpmnData] = useState<{ tasks: any[]; events: any[]; gateways: any[]; subProcesses: any[]; sequenceFlows: any[] } | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    information: true,
    habilitation: false,
    notifications: false,
    planification: false,
    resource: false,
  });
  const [infoData, setInfoData] = useState<InfoData>({
    category: 'administrative',
    board: 'Comité de supervision',
    instructions: 'Analyser le dossier et collecter les pièces manquantes.',
    deliverable: 'Synthèse signée + rapport PDF',
  });
  const [autoStart, setAutoStart] = useState(false);
  const [autoStartFrequency, setAutoStartFrequency] = useState<string>('');
  const [autoStartValue, setAutoStartValue] = useState<string>('');
  const [habilitationForm, setHabilitationForm] = useState<HabilitationFormState>({
    interestedEnabled: true,
    interestedUser: 'u3',
    entityEnabled: true,
    entity: 'entity-ops',
    groupEnabled: false,
    group: null,
    assignOwner: true,
    owner: 'u1',
    requireCheckpoint: false,
    checkpointLabel: '',
    allowReturn: true,
  });
  const [notificationsForm, setNotificationsForm] = useState<NotificationsFormState>({
    notifyOnCreation: true,
    alertEscalade: false,
    reminders: ['oneHourBefore'],
    sensitivity: 'public',
  });
  const [planificationForm, setPlanificationForm] = useState<PlanificationFormState>({
    allDay: false,
    durationValue: '02',
    durationUnit: 'Heures',
    criticality: '2',
    priority: 'P1',
    historyEnabled: true,
    kpis: {
      tasksProcessed: true,
      returnRate: true,
      avgInteractions: false,
      deadlineCompliance: true,
      waitingTime: false,
      priorityCompliance: false,
      emergencyHandling: false,
    },
    actions: {
      notifySupervisor: true,
      reassign: false,
      sendReminder: true,
      escalate: true,
      changePriority: false,
      blockWorkflow: false,
      generateAlert: false,
      requestJustification: false,
      correctiveAction: false,
      externalEscalation: false,
      closeDefect: false,
      followByKpi: false,
      planB: false,
    },
  });
  const [resourceForm, setResourceForm] = useState<ResourceFormState>({
    attachmentsEnabled: true,
    selectedNode: 'doc-audit',
    nodeType: 'document',
    securityLevel: 'high',
    externalTools: 'https://workspace.acme/tools',
    linkToTask: 'PROC-4821',
    businessRule: true,
    formResource: false,
    commonActions: {
      archive: true,
      sharePdf: false,
      describe: true,
      delete: false,
      consult: true,
      downloadZip: false,
    },
    documentActions: {
      import: true,
      edit: false,
      annotate: false,
      verify: false,
      search: false,
      remove: false,
      addNew: false,
      convertPdf: false,
      downloadPdf: true,
      downloadOriginal: false,
    },
  });

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, InfoData>>({});

  const nodeWidth = 200;
  const nodeHeight = 60;

  const calculateLayout = useCallback((rawNodes: Node[], rawEdges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 });

    rawNodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
    rawEdges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    const nodes = rawNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes, edges: rawEdges };
  }, []);

  const bpmnToFlow = useCallback((xml: string): { nodes: Node[]; edges: Edge[] } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    const subProcessIds = new Set<string>();
    const elementsInSubProcess = new Set<string>();

    const getStyleForType = (localName: string): React.CSSProperties => {
      if (localName.includes('ExclusiveGateway')) return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: '#fef3c7', border: '2px solid #f59e0b' };
      if (localName.includes('ParallelGateway')) return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: '#dbeafe', border: '2px solid #3b82f6' };
      if (localName.includes('InclusiveGateway')) return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: '#f3e8ff', border: '2px solid #a855f7' };
      if (localName.includes('SubProcess')) return { backgroundColor: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '8px', padding: '8px' };
      if (localName.includes('StartEvent')) return { borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #22c55e' };
      if (localName.includes('EndEvent')) return { borderRadius: '50%', backgroundColor: '#fee2e2', border: '2px solid #ef4444' };
      return { borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #94a3b8' };
    };

    const taskTypes = ['task', 'userTask', 'serviceTask', 'scriptTask', 'receiveTask', 'sendTask', 'manualTask', 'businessRuleTask'];
    const eventTypes = ['startEvent', 'endEvent', 'intermediateCatchEvent', 'intermediateThrowEvent', 'boundaryEvent'];
    const gatewayTypes = ['exclusiveGateway', 'parallelGateway', 'inclusiveGateway'];
    const subProcessTypes = ['subProcess'];
    const allBpmnTypes = [...taskTypes, ...eventTypes, ...gatewayTypes, ...subProcessTypes, 'sequenceFlow'];

    const allElements = doc.getElementsByTagName('*');
    const bpmnElements: Element[] = [];
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      if (allBpmnTypes.includes(el.localName)) {
        bpmnElements.push(el);
      }
    }

    for (const el of bpmnElements) {
      if (el.localName === 'subProcess') {
        const id = el.getAttribute('id');
        if (id) subProcessIds.add(id);
        const childElements = el.querySelectorAll('*');
        for (const child of childElements) {
          const childId = child.getAttribute('id');
          if (childId) elementsInSubProcess.add(childId);
        }
      }
    }

    for (const el of bpmnElements) {
      const localName = el.localName;
      const id = el.getAttribute('id');
      const name = el.getAttribute('name') || '';

      if (localName === 'subProcess') {
        rawNodes.push({
          id: id || `sub-${rawNodes.length}`,
          type: 'subProcess',
          data: { label: name || 'Sous-processus' },
          position: { x: 0, y: 0 },
          style: getStyleForType('SubProcess'),
        });
        continue;
      }

      if (elementsInSubProcess.has(id || '')) continue;

      if (localName === 'sequenceFlow') {
        const source = el.getAttribute('sourceRef');
        const target = el.getAttribute('targetRef');
        if (source && target && !elementsInSubProcess.has(source) && !elementsInSubProcess.has(target)) {
          rawEdges.push({
            id: id || `flow-${rawEdges.length}`,
            source,
            target,
            label: name || '',
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#64748b' },
          });
        }
        continue;
      }

      if (taskTypes.includes(localName)) {
        rawNodes.push({
          id: id || `task-${rawNodes.length}`,
          type: 'default',
          data: { label: name || 'Tâche sans nom' },
          position: { x: 0, y: 0 },
          style: { borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #94a3b8' },
        });
      } else if (localName === 'startEvent') {
        rawNodes.push({
          id: id || `start-${rawNodes.length}`,
          type: 'input',
          data: { label: name || 'Début' },
          position: { x: 0, y: 0 },
          style: getStyleForType('StartEvent'),
        });
      } else if (localName === 'endEvent') {
        rawNodes.push({
          id: id || `end-${rawNodes.length}`,
          type: 'output',
          data: { label: name || 'Fin' },
          position: { x: 0, y: 0 },
          style: getStyleForType('EndEvent'),
        });
      } else if (['intermediateCatchEvent', 'intermediateThrowEvent', 'boundaryEvent'].includes(localName)) {
        rawNodes.push({
          id: id || `event-${rawNodes.length}`,
          type: 'default',
          data: { label: name || 'Événement' },
          position: { x: 0, y: 0 },
          style: { borderRadius: '50%', backgroundColor: '#fef9c3', border: '2px solid #eab308' },
        });
      } else if (localName === 'exclusiveGateway') {
        rawNodes.push({
          id: id || `xor-${rawNodes.length}`,
          type: 'gateway',
          data: { label: name || 'XOR' },
          position: { x: 0, y: 0 },
          style: getStyleForType('ExclusiveGateway'),
        });
      } else if (localName === 'parallelGateway') {
        rawNodes.push({
          id: id || `and-${rawNodes.length}`,
          type: 'gateway',
          data: { label: name || 'AND' },
          position: { x: 0, y: 0 },
          style: getStyleForType('ParallelGateway'),
        });
      } else if (localName === 'inclusiveGateway') {
        rawNodes.push({
          id: id || `or-${rawNodes.length}`,
          type: 'gateway',
          data: { label: name || 'OR' },
          position: { x: 0, y: 0 },
          style: getStyleForType('InclusiveGateway'),
        });
      }
    }

    return calculateLayout(rawNodes, rawEdges);
  }, [calculateLayout]);

  const defaultNodes: Node[] = [
    { id: 'start', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Début' }, style: { borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #22c55e' } },
    { id: 'analysis', position: { x: 0, y: 0 }, data: { label: 'Analyse dossier' }, style: { borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #94a3b8' } },
    { id: 'decision', position: { x: 0, y: 0 }, data: { label: 'Comité décision' }, style: { borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #94a3b8' } },
    { id: 'notify', type: 'output', position: { x: 0, y: 0 }, data: { label: 'Notification client' }, style: { borderRadius: '50%', backgroundColor: '#fee2e2', border: '2px solid #ef4444' } },
  ];

  const defaultEdges: Edge[] = [
    { id: 'e1-2', source: 'start', target: 'analysis', label: '', animated: true, style: { stroke: '#64748b', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#64748b' } },
    { id: 'e2-3', source: 'analysis', target: 'decision', label: '', animated: true, style: { stroke: '#64748b', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#64748b' } },
    { id: 'e3-4', source: 'decision', target: 'notify', label: '', animated: true, style: { stroke: '#64748b', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#64748b' } },
  ];

  useEffect(() => {
    if (bpmnXml) {
      const { nodes, edges } = bpmnToFlow(bpmnXml);
      if (nodes.length > 0) {
        setCurrentNodes(nodes);
        setCurrentEdges(edges);
      } else {
        setCurrentNodes(defaultNodes);
        setCurrentEdges(defaultEdges);
      }
    } else {
      setCurrentNodes(defaultNodes);
      setCurrentEdges(defaultEdges);
    }
    setBreadcrumb([]);
  }, [bpmnXml, bpmnToFlow]);

  const getSubProcessElements = useCallback((subProcessId: string, xml: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    const subProcessEl = doc.querySelector(`[id="${subProcessId}"]`);
    if (!subProcessEl) return calculateLayout(rawNodes, rawEdges);

    const childElements = subProcessEl.querySelectorAll('*');
    const taskTypes = ['task', 'userTask', 'serviceTask', 'scriptTask', 'receiveTask', 'sendTask', 'manualTask', 'businessRuleTask'];
    const eventTypes = ['startEvent', 'endEvent', 'intermediateCatchEvent', 'intermediateThrowEvent', 'boundaryEvent'];
    const gatewayTypes = ['exclusiveGateway', 'parallelGateway', 'inclusiveGateway'];
    const subProcessTypes = ['subProcess'];
    const allBpmnTypes = [...taskTypes, ...eventTypes, ...gatewayTypes, ...subProcessTypes, 'sequenceFlow'];

    for (const el of childElements) {
      if (!allBpmnTypes.includes(el.localName)) continue;
      const localName = el.localName;
      const id = el.getAttribute('id');
      const name = el.getAttribute('name') || '';

      if (taskTypes.includes(localName)) {
        rawNodes.push({
          id: id || `task-${rawNodes.length}`,
          type: 'default',
          data: { label: name || 'Tâche sans nom' },
          position: { x: 0, y: 0 },
          style: { borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #94a3b8' },
        });
      } else if (localName === 'startEvent') {
        rawNodes.push({
          id: id || `start-${rawNodes.length}`,
          type: 'input',
          data: { label: name || 'Début' },
          position: { x: 0, y: 0 },
          style: { borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #22c55e' },
        });
      } else if (localName === 'endEvent') {
        rawNodes.push({
          id: id || `end-${rawNodes.length}`,
          type: 'output',
          data: { label: name || 'Fin' },
          position: { x: 0, y: 0 },
          style: { borderRadius: '50%', backgroundColor: '#fee2e2', border: '2px solid #ef4444' },
        });
      } else if (['intermediateCatchEvent', 'intermediateThrowEvent', 'boundaryEvent'].includes(localName)) {
        rawNodes.push({
          id: id || `event-${rawNodes.length}`,
          type: 'default',
          data: { label: name || 'Événement' },
          position: { x: 0, y: 0 },
          style: { borderRadius: '50%', backgroundColor: '#fef9c3', border: '2px solid #eab308' },
        });
      } else if (localName === 'exclusiveGateway' || localName === 'parallelGateway' || localName === 'inclusiveGateway') {
        const style = localName === 'exclusiveGateway'
          ? { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }
          : localName === 'parallelGateway'
            ? { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: '#dbeafe', border: '2px solid #3b82f6' }
            : { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: '#f3e8ff', border: '2px solid #a855f7' };
        rawNodes.push({
          id: id || `gw-${rawNodes.length}`,
          type: 'gateway',
          data: { label: name || (localName === 'exclusiveGateway' ? 'XOR' : localName === 'parallelGateway' ? 'AND' : 'OR') },
          position: { x: 0, y: 0 },
          style,
        });
      } else if (localName === 'subProcess') {
        rawNodes.push({
          id: id || `sub-${rawNodes.length}`,
          type: 'subProcess',
          data: { label: name || 'Sous-processus' },
          position: { x: 0, y: 0 },
          style: { backgroundColor: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '8px', padding: '8px' },
        });
      } else if (localName === 'sequenceFlow') {
        const source = el.getAttribute('sourceRef');
        const target = el.getAttribute('targetRef');
        if (source && target) {
          rawEdges.push({
            id: id || `flow-${rawEdges.length}`,
            source,
            target,
            label: name || '',
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#64748b' },
          });
        }
      }
    }

    return calculateLayout(rawNodes, rawEdges);
  }, [calculateLayout]);

  const handleSubProcessClick = useCallback((subProcessId: string) => {
    if (!bpmnXml) return;
    const subProcessEl = Array.from(bpmnXml.matchAll(/<bpmn:subProcess[^>]*id="([^"]+)"[^>]*name="([^"]*)"/g))
      .find(m => m[1] === subProcessId);
    const subName = subProcessEl ? subProcessEl[2] || 'Sous-processus' : 'Sous-processus';
    
    setBreadcrumb(prev => [...prev, { id: subProcessId, name: subName }]);
    const { nodes, edges } = getSubProcessElements(subProcessId, bpmnXml);
    setCurrentNodes(nodes);
    setCurrentEdges(edges);
  }, [bpmnXml, getSubProcessElements]);

  const handleBreadcrumbClick = useCallback((level: number) => {
    if (level === 0) {
      if (bpmnXml) {
        const { nodes, edges } = bpmnToFlow(bpmnXml);
        if (nodes.length > 0) {
          setCurrentNodes(nodes);
          setCurrentEdges(edges);
        } else {
          setCurrentNodes(defaultNodes);
          setCurrentEdges(defaultEdges);
        }
      } else {
        setCurrentNodes(defaultNodes);
        setCurrentEdges(defaultEdges);
      }
      setBreadcrumb([]);
      return;
    }

    const newBreadcrumb = breadcrumb.slice(0, level);
    setBreadcrumb(newBreadcrumb);

    if (bpmnXml && newBreadcrumb.length > 0) {
      const lastSub = newBreadcrumb[newBreadcrumb.length - 1];
      const { nodes, edges } = getSubProcessElements(lastSub.id, bpmnXml);
      setCurrentNodes(nodes);
      setCurrentEdges(edges);
    }
  }, [breadcrumb, bpmnXml, bpmnToFlow, getSubProcessElements]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'subProcess') {
      handleSubProcessClick(node.id);
    } else {
      setSelectedNode(node);
      // Initialize node config if not exists
      if (!nodeConfigs[node.id]) {
        setNodeConfigs(prev => ({
          ...prev,
          [node.id]: {
            category: 'administrative',
            board: 'Comité de supervision',
            instructions: `Configurer la tâche: ${node.data?.label || node.id}`,
            deliverable: 'Livrable attendu',
          }
        }));
      }
    }
  }, [handleSubProcessClick, nodeConfigs]);

  const flowNodes = useMemo(() => {
    return currentNodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        ...(selectedNode?.id === node.id && {
          boxShadow: '0 0 0 4px #3c50e0, 0 4px 12px rgba(60, 80, 224, 0.4)',
          borderColor: '#3c50e0',
        }),
      },
    }));
  }, [currentNodes, selectedNode]);
  const flowEdges = currentEdges;

  const currentNodeConfig = selectedNode ? (nodeConfigs[selectedNode.id] || infoData) : infoData;
  const setCurrentNodeConfig = (updater: (prev: InfoData) => InfoData) => {
    if (selectedNode) {
      setNodeConfigs(prev => ({
        ...prev,
        [selectedNode.id]: updater(prev[selectedNode.id] || infoData)
      }));
    } else {
      setInfoData(updater);
    }
  };

  const configSections = useMemo(
    () => [
      {
        id: 'information',
        label: 'Informations',
        description: selectedNode 
          ? `Configuration pour: ${selectedNode.data?.label || selectedNode.id}` 
          : 'Résumez le contexte métier de la tâche sélectionnée.',
        content: (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Instructions</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                rows={3}
                value={currentNodeConfig.instructions}
                onChange={(event) => setCurrentNodeConfig((prev) => ({ ...prev, instructions: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Livrable attendu</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                rows={2}
                value={currentNodeConfig.deliverable}
                onChange={(event) => setCurrentNodeConfig((prev) => ({ ...prev, deliverable: event.target.value }))}
              />
            </div>
          </div>
        ),
      },
      {
        id: 'habilitation',
        label: 'Habilitations',
        description: 'Définissez la personne intéressée.',
        content: (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Personne intéressée</p>
                <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={habilitationForm.interestedEnabled}
                    onChange={(event) =>
                      setHabilitationForm((prev) => ({ ...prev, interestedEnabled: event.target.checked }))
                    }
                  />
                  Activer
                </label>
              </div>
              {habilitationForm.interestedEnabled && (
                <select
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={habilitationForm.interestedUser ?? ''}
                  onChange={(event) =>
                    setHabilitationForm((prev) => ({ ...prev, interestedUser: event.target.value || null }))
                  }
                >
                  <option value="">Sélectionner un collaborateur</option>
                  {(backendUsers.length > 0 ? backendUsers : fakeUsers).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.role}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'notifications',
        label: 'Notifications',
        description: 'Pilotez les rappels et escalades automatiques.',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[{
                label: 'Notification à l’assignation',
                field: 'notifyOnCreation' as const,
              },
              {
                label: 'Alerte sur échéance',
                field: 'alertEscalade' as const,
              }].map((toggle) => (
                <label key={toggle.field} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={notificationsForm[toggle.field]}
                    onChange={(event) =>
                      setNotificationsForm((prev) => ({ ...prev, [toggle.field]: event.target.checked }))
                    }
                  />
                  {toggle.label}
                </label>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Rappels</p>
              <div className="flex flex-wrap gap-2">
                {reminderPresets.map((reminder) => {
                  const isActive = notificationsForm.reminders.includes(reminder.id);
                  return (
                    <button
                      key={reminder.id}
                      type="button"
                      onClick={() =>
                        setNotificationsForm((prev) => ({
                          ...prev,
                          reminders: isActive
                            ? prev.reminders.filter((item) => item !== reminder.id)
                            : [...prev.reminders, reminder.id],
                        }))
                      }
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#3c50e0] text-white shadow'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {reminder.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Sensibilité</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'public', label: 'Public' },
                  { value: 'confidential', label: 'Confidentiel' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                      notificationsForm.sensitivity === option.value
                        ? 'border-[#3c50e0] bg-[#3c50e0]/10 text-[#3c50e0]'
                        : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="notification-sensitivity"
                      className="mr-2"
                      checked={notificationsForm.sensitivity === option.value}
                      onChange={() =>
                        setNotificationsForm((prev) => ({ ...prev, sensitivity: option.value as 'public' | 'confidential' }))
                      }
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300/80 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-white">Escalades configurées</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>+2h : Ops Lead</li>
                <li>+6h : Risk Director</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],
    [infoData, habilitationForm, notificationsForm, selectedNode, nodeConfigs]
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next: Record<string, boolean> = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>);

      next[id] = !prev[id];
      return next;
    });
  };

  const handleBeforeNext = async (stepIndex: number): Promise<boolean> => {
    if (stepIndex === 1) {
      const blob = await step2Ref.current?.exportBpmn();
      if (!blob) {
        toast.error('Impossible d\'exporter le diagramme BPMN.');
        return false;
      }
      const bpmnXml = await blob.text();
      try {
        await ConceptionService.uploadBpmn(bpmnXml);
        setBpmnXml(bpmnXml);
        toast.success('BPMN envoyé au serveur.');
        return true;
      } catch (err) {
        toast.error('Erreur lors de l\'envoi du BPMN.');
        return false;
      }
    }
    return true;
  };

  const steps = [
    {
      title: 'Informations générales',
      description: 'Cadrez le processus et définissez ses parties prenantes.',
      content: (
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Nom du processus"
            placeholder="E.g. Validation des contrats premium"
            value={processName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProcessName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              rows={4}
              placeholder="Exposez le périmètre et les objectifs décisionnels."
              value={processDescription}
              onChange={(e) => setProcessDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Démarrage automatique</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lancer le processus selon une planification</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoStart(!autoStart)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                autoStart ? 'bg-[#3c50e0]' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  autoStart ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {autoStart && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Fréquence</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={autoStartFrequency}
                  onChange={(e) => { setAutoStartFrequency(e.target.value); setAutoStartValue(''); }}
                >
                  <option value="">Sélectionner une fréquence</option>
                  <option value="jour">Jour</option>
                  <option value="semaine">Semaine</option>
                  <option value="mois">Mois</option>
                  <option value="trimestre">Trimestre</option>
                  <option value="semestre">Semestre</option>
                  <option value="annee">Année</option>
                </select>
              </div>
              {autoStartFrequency === 'jour' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Tous les X jours</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    placeholder="Ex: 1, 2, 3..."
                    value={autoStartValue}
                    onChange={(e) => setAutoStartValue(e.target.value)}
                  />
                </div>
              )}
              {autoStartFrequency === 'semaine' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Jour de la semaine</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={autoStartValue}
                    onChange={(e) => setAutoStartValue(e.target.value)}
                  >
                    <option value="">Sélectionner un jour</option>
                    <option value="lundi">Lundi</option>
                    <option value="mardi">Mardi</option>
                    <option value="mercredi">Mercredi</option>
                    <option value="jeudi">Jeudi</option>
                    <option value="vendredi">Vendredi</option>
                    <option value="samedi">Samedi</option>
                    <option value="dimanche">Dimanche</option>
                  </select>
                </div>
              )}
              {autoStartFrequency === 'mois' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Mois</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={autoStartValue}
                    onChange={(e) => setAutoStartValue(e.target.value)}
                  >
                    <option value="">Sélectionner un mois</option>
                    <option value="janvier">Janvier</option>
                    <option value="fevrier">Février</option>
                    <option value="mars">Mars</option>
                    <option value="avril">Avril</option>
                    <option value="mai">Mai</option>
                    <option value="juin">Juin</option>
                    <option value="juillet">Juillet</option>
                    <option value="aout">Août</option>
                    <option value="septembre">Septembre</option>
                    <option value="octobre">Octobre</option>
                    <option value="novembre">Novembre</option>
                    <option value="decembre">Décembre</option>
                  </select>
                </div>
              )}
              {autoStartFrequency === 'trimestre' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Trimestre</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={autoStartValue}
                    onChange={(e) => setAutoStartValue(e.target.value)}
                  >
                    <option value="">Sélectionner un trimestre</option>
                    <option value="T1">T1 (Janvier - Mars)</option>
                    <option value="T2">T2 (Avril - Juin)</option>
                    <option value="T3">T3 (Juillet - Septembre)</option>
                    <option value="T4">T4 (Octobre - Décembre)</option>
                  </select>
                </div>
              )}
              {autoStartFrequency === 'semestre' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Semestre</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={autoStartValue}
                    onChange={(e) => setAutoStartValue(e.target.value)}
                  >
                    <option value="">Sélectionner un semestre</option>
                    <option value="S1">S1 (Janvier - Juin)</option>
                    <option value="S2">S2 (Juillet - Décembre)</option>
                  </select>
                </div>
              )}
              {autoStartFrequency === 'annee' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Mois de l'année</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={autoStartValue}
                    onChange={(e) => setAutoStartValue(e.target.value)}
                  >
                    <option value="">Sélectionner un mois</option>
                    <option value="janvier">Janvier</option>
                    <option value="fevrier">Février</option>
                    <option value="mars">Mars</option>
                    <option value="avril">Avril</option>
                    <option value="mai">Mai</option>
                    <option value="juin">Juin</option>
                    <option value="juillet">Juillet</option>
                    <option value="aout">Août</option>
                    <option value="septembre">Septembre</option>
                    <option value="octobre">Octobre</option>
                    <option value="novembre">Novembre</option>
                    <option value="decembre">Décembre</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Modélisation',
      description: 'Choisissez la méthode de création et structurez la colonne vertébrale BPMN.',
      content: (
        <div className="space-y-6">
          {/* <Select label="Mode de modélisation" options={modelingOptions} /> */}
          <Step2Model ref={step2Ref} sharedData={step2SharedData} setSharedData={setStep2SharedData} />
        </div>
      ),
    },
    {
      title: 'Configuration',
      description: 'Paramétrez l’exécution et les intégrations.',
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Diagramme</p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vue BPMN interactive</h3>
                </div>
                <Button type="button" variant="secondary" className="h-9 px-4 text-xs">
                  Exporter BPMN
                </Button>
              </div>
              {breadcrumb.length > 0 && (
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(0)}
                    className="text-[#3c50e0] hover:underline"
                  >
                    Principal
                  </button>
                  {breadcrumb.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <span className="text-slate-400">&gt;</span>
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(idx + 1)}
                        className={`${idx === breadcrumb.length - 1 ? 'font-semibold text-slate-900 dark:text-white' : 'text-[#3c50e0] hover:underline'}`}
                      >
                        {item.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}
              <div className="h-[520px] overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                <ReactFlow nodes={flowNodes} edges={flowEdges} fitView minZoom={0.4} maxZoom={1.6} onNodeClick={onNodeClick}>
                  <Background gap={16} color="#e2e8f0" />
                  <Controls position="bottom-right" showInteractive={false} />
                </ReactFlow>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Paramétrage</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedNode ? `Config: ${selectedNode.data?.label || selectedNode.id}` : 'Panneau de configuration'}
                </h3>
                {selectedNode && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Type: {selectedNode.type || 'default'} | ID: {selectedNode.id}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                {configSections.map((section) => {
                  const isOpen = openSections[section.id];
                  return (
                    <div key={section.id} className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{section.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{section.description}</p>
                        </div>
                        <span className={`text-sm font-semibold transition ${isOpen ? 'text-[#3c50e0]' : 'text-slate-400'}`}>
                          {isOpen ? '–' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 px-4 py-4 text-sm dark:border-slate-800">
                          <div className="space-y-4">{section.content}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      ),
    },
  ];

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3c50e0]">Nouveau flux</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Création d’un processus</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Renseignez les éléments clés avant de lancer votre studio de modélisation.
        </p>
      </div>

      <FormWizard
        steps={steps}
        onBeforeNext={handleBeforeNext}
        onComplete={async () => {
          if (!processName.trim()) {
            toast.error('Veuillez renseigner le nom du processus (étape 1).');
            return;
          }
          toast.success(`Processus "${processName}" configuré et déployé.`);
          navigate({ to: '/conception' });
        }}
      />
    </div>
  );
}
