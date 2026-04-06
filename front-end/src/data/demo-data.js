/**
 * Données de démonstration offline
 * Utilisées par ProcessMonitorPage quand le backend n'est pas disponible
 */

// ─── BPMN XML — Onboarding Client ────────────────────────────────────────────
export const DEMO_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
             targetNamespace="http://demo.processintel"
             id="definitions_demo">

  <process id="onboarding_client" name="Onboarding Client" isExecutable="true">

    <startEvent id="start" name="Demande reçue">
      <outgoing>flow1</outgoing>
    </startEvent>

    <userTask id="verification_identite" name="Vérification identité">
      <incoming>flow1</incoming>
      <outgoing>flow2</outgoing>
    </userTask>

    <exclusiveGateway id="gw_valide" name="Identité valide ?">
      <incoming>flow2</incoming>
      <outgoing>flow3</outgoing>
      <outgoing>flow_reject</outgoing>
    </exclusiveGateway>

    <userTask id="validation_manager" name="Validation manager">
      <incoming>flow3</incoming>
      <outgoing>flow4</outgoing>
    </userTask>

    <serviceTask id="creation_compte" name="Création compte">
      <incoming>flow4</incoming>
      <outgoing>flow5</outgoing>
    </serviceTask>

    <serviceTask id="notification_client" name="Notification client">
      <incoming>flow5</incoming>
      <outgoing>flow6</outgoing>
    </serviceTask>

    <endEvent id="end_ok" name="Client activé">
      <incoming>flow6</incoming>
    </endEvent>

    <endEvent id="end_reject" name="Demande rejetée">
      <incoming>flow_reject</incoming>
    </endEvent>

    <sequenceFlow id="flow1"      sourceRef="start"               targetRef="verification_identite"/>
    <sequenceFlow id="flow2"      sourceRef="verification_identite" targetRef="gw_valide"/>
    <sequenceFlow id="flow3"      sourceRef="gw_valide"            targetRef="validation_manager" name="Oui"/>
    <sequenceFlow id="flow_reject" sourceRef="gw_valide"           targetRef="end_reject"         name="Non"/>
    <sequenceFlow id="flow4"      sourceRef="validation_manager"   targetRef="creation_compte"/>
    <sequenceFlow id="flow5"      sourceRef="creation_compte"      targetRef="notification_client"/>
    <sequenceFlow id="flow6"      sourceRef="notification_client"  targetRef="end_ok"/>
  </process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="onboarding_client">

      <bpmndi:BPMNShape id="start_di"                   bpmnElement="start">
        <dc:Bounds x="152" y="202" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="128" y="245" width="85" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="verification_identite_di"   bpmnElement="verification_identite">
        <dc:Bounds x="240" y="180" width="100" height="80"/>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="gw_valide_di"               bpmnElement="gw_valide" isMarkerVisible="true">
        <dc:Bounds x="395" y="195" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="378" y="252" width="85" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="validation_manager_di"      bpmnElement="validation_manager">
        <dc:Bounds x="500" y="180" width="100" height="80"/>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="creation_compte_di"         bpmnElement="creation_compte">
        <dc:Bounds x="660" y="180" width="100" height="80"/>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="notification_client_di"     bpmnElement="notification_client">
        <dc:Bounds x="820" y="180" width="100" height="80"/>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="end_ok_di"                  bpmnElement="end_ok">
        <dc:Bounds x="982" y="202" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="960" y="245" width="80" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="end_reject_di"              bpmnElement="end_reject">
        <dc:Bounds x="407" y="320" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="380" y="363" width="90" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="flow1_di"       bpmnElement="flow1">
        <di:waypoint x="188" y="220"/><di:waypoint x="240" y="220"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flow2_di"       bpmnElement="flow2">
        <di:waypoint x="340" y="220"/><di:waypoint x="395" y="220"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flow3_di"       bpmnElement="flow3">
        <di:waypoint x="445" y="220"/><di:waypoint x="500" y="220"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flow_reject_di" bpmnElement="flow_reject">
        <di:waypoint x="420" y="245"/><di:waypoint x="420" y="320"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flow4_di"       bpmnElement="flow4">
        <di:waypoint x="600" y="220"/><di:waypoint x="660" y="220"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flow5_di"       bpmnElement="flow5">
        <di:waypoint x="760" y="220"/><di:waypoint x="820" y="220"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flow6_di"       bpmnElement="flow6">
        <di:waypoint x="920" y="220"/><di:waypoint x="982" y="220"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

// ─── Logs de démo ─────────────────────────────────────────────────────────────
// Mappés sur les IDs des éléments BPMN ci-dessus
export const DEMO_LOGS = [
  // verification_identite — rapide, quelques erreurs
  ...Array.from({ length: 80 }, (_, i) => ({
    id: `log-vi-${i}`,
    taskName: 'verification_identite',
    durationMs: (60 + Math.random() * 120) * 60000, // 1–3h en ms
    eventType: Math.random() < 0.04 ? 'ERROR' : 'COMPLETE',
    processInstanceId: `CASE-${String(i + 1).padStart(3, '0')}`,
  })),
  // validation_manager — lent, goulot principal
  ...Array.from({ length: 75 }, (_, i) => ({
    id: `log-vm-${i}`,
    taskName: 'validation_manager',
    durationMs: (480 + Math.random() * 720) * 60000, // 8–20h en ms
    eventType: Math.random() < 0.06 ? 'ERROR' : 'COMPLETE',
    processInstanceId: `CASE-${String(i + 1).padStart(3, '0')}`,
  })),
  // creation_compte — très rapide, fiable
  ...Array.from({ length: 70 }, (_, i) => ({
    id: `log-cc-${i}`,
    taskName: 'creation_compte',
    durationMs: (5 + Math.random() * 25) * 60000, // 5–30min
    eventType: Math.random() < 0.01 ? 'ERROR' : 'COMPLETE',
    processInstanceId: `CASE-${String(i + 1).padStart(3, '0')}`,
  })),
  // notification_client — instantané
  ...Array.from({ length: 70 }, (_, i) => ({
    id: `log-nc-${i}`,
    taskName: 'notification_client',
    durationMs: (1 + Math.random() * 4) * 60000, // 1–5min
    eventType: 'COMPLETE',
    processInstanceId: `CASE-${String(i + 1).padStart(3, '0')}`,
  })),
  // flow1 — volume élevé
  ...Array.from({ length: 80 }, (_, i) => ({
    id: `log-f1-${i}`,
    taskName: 'flow1',
    durationMs: 0,
    eventType: 'COMPLETE',
    processInstanceId: `CASE-${String(i + 1).padStart(3, '0')}`,
  })),
];

export const DEMO_METRICS = {
  totalInstances: 80,
  completedInstances: 70,
  completionRate: 0.875,
  averageExecutionTime: 780, // minutes
};

export const DEMO_PROCESSES = [
  { id: 'onboarding_client', key: 'onboarding_client', name: 'Onboarding Client (démo)' },
  { id: 'traitement_reclamation', key: 'traitement_reclamation', name: 'Traitement Réclamation (démo)' },
  { id: 'approbation_budget', key: 'approbation_budget', name: 'Approbation Budget (démo)' },
];
