import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui';

interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface FormWizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
  onBeforeNext?: (stepIndex: number) => Promise<boolean>;
}

export function FormWizard({ steps, onComplete, onBeforeNext }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = steps.length;
  const activeStep = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStep(index);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    if (isLastStep) {
      onComplete?.();
    } else {
      const allowed = await onBeforeNext?.(currentStep);
      if (allowed === false) return;
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <ol className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          {steps.map((step, index) => {
            const status = index === currentStep ? 'current' : index < currentStep ? 'complete' : 'upcoming';
            const isCompleted = status === 'complete';
            const isCurrent = status === 'current';

            const bulletClasses = isCompleted
              ? 'bg-[#3c50e0] text-white border-[#3c50e0]'
              : isCurrent
                ? 'bg-white text-[#3c50e0] border-[#3c50e0] shadow-[0_0_0_3px_rgba(60,80,224,0.15)]'
                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700';

            const titleColor = isCompleted || isCurrent ? 'text-[#3c50e0]' : 'text-slate-900 dark:text-white';

            return (
              <li key={step.title} className="flex w-full items-center gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={status === 'upcoming'}
                    className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition ${
                      status === 'upcoming' ? 'cursor-not-allowed opacity-60' : ''
                    } ${bulletClasses}`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                  </button>
                  <div>
                    <p className={`text-sm font-semibold ${titleColor}`}>{step.title}</p>
                    {step.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                    )}
                  </div>
                </div>

                {index < totalSteps - 1 && (
                  <div className="hidden flex-1 items-center md:flex">
                    <span
                      className={`h-0.5 w-full rounded-full ${
                        index < currentStep ? 'bg-[#3c50e0]' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{activeStep.title}</h2>
          {activeStep.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{activeStep.description}</p>
          )}
        </div>
        <div className="space-y-6">{activeStep.content}</div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Étape {currentStep + 1} sur {totalSteps}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrevious} disabled={isFirstStep}>
            Retour
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>{isLastStep ? 'Finaliser' : 'Continuer'}</Button>
        </div>
      </div>
    </div>
  );
}
