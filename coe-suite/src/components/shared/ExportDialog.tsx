import { Button } from "@worksuiux-ctrl/my-design-system";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { exportToExcel, type ExportColumn } from "../../lib/exportUtils";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  data: any[];
  columns: ExportColumn[];
  filename: string;
}

export function ExportDialog({ open, onOpenChange, data, columns, filename }: ExportDialogProps) {
  const handleExcel = async () => {
    await exportToExcel(data, columns, filename);
    toast.success("Excel descargado", { description: `${data.length} registros exportados.` });
    onOpenChange(false);
  };

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title="Exportar Datos" size="sm">
      <p className="text-sm text-gray-500 mb-4">Selecciona el formato de exportación</p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-24 flex-col gap-2 w-full" onClick={handleExcel}>
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <span className="text-sm font-medium">Excel (.xlsx)</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2 w-full" disabled>
          <FileText className="h-8 w-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">PDF (próximamente)</span>
        </Button>
      </div>
    </Modal>
  );
}
