import { createPortal } from "react-dom";
import { Button } from "@coe/design-system";
import { AlertTriangle } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName?: string;
  onConfirm: () => void;
}

export function DeleteDialog({
  open, onOpenChange, title, description, itemName, onConfirm,
}: DeleteDialogProps) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{description}</p>
              {itemName && (
                <p className="text-sm text-gray-700 mt-1">
                  Se eliminará permanentemente <strong>{itemName}</strong>. Esta acción no se puede deshacer.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { onConfirm(); onOpenChange(false); }}>Eliminar</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
