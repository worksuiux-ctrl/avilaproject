import { useState, type ReactNode } from "react";
import { Button } from "@worksuiux-ctrl/my-design-system";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "../ui/Modal";

export interface WizardStep {
  title: string;
  description?: string;
  isValid?: boolean;
  content: ReactNode;
}

interface WizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  steps: WizardStep[];
  onFinish: () => void;
  headerAction?: ReactNode;
  isEditing?: boolean;
  finishLabel?: string;
}

export function WizardDialog({
  open, onOpenChange, title, steps, onFinish, headerAction, isEditing, finishLabel,
}: WizardDialogProps) {
  const [step, setStep] = useState(0);

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const canNext = current?.isValid !== false;
  const canFinish = isLast && current?.isValid !== false;

  return (
    <Modal
      open={open}
      onClose={() => { onOpenChange(false); setStep(0); }}
      size="lg"
      title={
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-semibold">{current?.title || title}</h3>
            {current?.description && <p className="text-sm text-gray-500 mt-0.5">{current.description}</p>}
          </div>
          {headerAction}
        </div>
      }
      actions={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-green-500" : i < step ? "bg-green-300" : "bg-gray-200"}`} />
            ))}
            <span className="ml-2">Paso {step + 1} de {steps.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="outline" onClick={() => setStep(step - 1)} iconLeft={<ChevronLeft className="h-4 w-4" />}>
                Anterior
              </Button>
            )}
            {isLast ? (
              <Button onClick={() => { onFinish(); setStep(0); }} disabled={!canFinish}>
                {isEditing ? "Guardar Cambios" : (finishLabel || "Guardar")}
              </Button>
            ) : (
              <Button onClick={() => { if (canNext) setStep(step + 1); }} disabled={!canNext} iconRight={<ChevronRight className="h-4 w-4" />}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {current?.content}
      </div>
    </Modal>
  );
}
