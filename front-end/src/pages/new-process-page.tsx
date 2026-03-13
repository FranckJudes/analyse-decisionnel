import React, { useRef, useState } from 'react';
import { FormWizard } from '../components/forms/form-wizard';
import { Button, Input, Select } from '../components/ui';
import { Step2Model, type Step2ModelHandles, type Step2SharedData } from '../components/process/step2-model';

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
  const step2Ref = useRef<Step2ModelHandles>(null);
  const [step2SharedData, setStep2SharedData] = useState<Step2SharedData>({});

  const steps = [
    {
      title: 'Informations générales',
      description: 'Cadrez le processus et définissez ses parties prenantes.',
      content: (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Nom du processus" placeholder="E.g. Validation des contrats premium" />
          <Input label="Owner" placeholder="E.g. Direction risques" />
          <Select
            label="Domaine"
            options={[
              { value: 'finance', label: 'Finance' },
              { value: 'operations', label: 'Opérations' },
              { value: 'marketing', label: 'Marketing' },
            ]}
          />
          <Select
            label="Criticité"
            options={[
              { value: 'low', label: 'Basse' },
              { value: 'medium', label: 'Moyenne' },
              { value: 'high', label: 'Critique' },
            ]}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              rows={4}
              placeholder="Exposez le périmètre et les objectifs décisionnels."
            />
          </div>
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
        <div className="space-y-4">
          <Select label="Moteur d’exécution" options={engineOptions} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="SLA cible" placeholder="J+5" />
            <Input label="Fréquence de revue" placeholder="Mensuelle" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-white">Intégrations planifiées</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Webhooks incident Fournisseur</li>
              <li>Data warehouse Snowflake</li>
              <li>Alertes Slack #process-watch</li>
            </ul>
          </div>
          <Button type="button" variant="secondary" className="w-full justify-center">
            Ajouter une intégration
          </Button>
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

      <FormWizard steps={steps} onComplete={() => console.log('Wizard complete')} />
    </div>
  );
}
