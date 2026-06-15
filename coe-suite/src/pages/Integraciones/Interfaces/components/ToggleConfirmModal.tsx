import { Dialog, Button } from "@coe/design-system";
import { AlertTriangle } from "lucide-react";

interface ToggleConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  interfaceName: string;
  newStatus: "started" | "stopped";
}

export function ToggleConfirmModal({ open, onClose, onConfirm, interfaceName, newStatus }: ToggleConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Confirmar cambio de estado" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-ind-rojo/10 shrink-0">
            <AlertTriangle className="w-5 h-5 text-ind-rojo" />
          </div>
          <div>
            <p className="text-[13px] text-text-darkgrey font-medium">
              {newStatus === "stopped"
                ? `¿Está seguro de que desea detener la interfaz "${interfaceName}"?`
                : `¿Está seguro de que desea iniciar la interfaz "${interfaceName}"?`}
            </p>
            <p className="text-[12px] text-text-grey mt-1">
              {newStatus === "stopped"
                ? "Esto pausará la sincronización en tiempo real con el Core Bancario. Los datos dejarán de fluir hasta que la interfaz sea reactivada."
                : "Esto reanudará la sincronización en tiempo real con el Core Bancario. Los datos comenzarán a fluir nuevamente."}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose} className="!text-[12px]">
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm} className="!text-[12px]">
          Confirmar
        </Button>
      </div>
    </Dialog>
  );
}
