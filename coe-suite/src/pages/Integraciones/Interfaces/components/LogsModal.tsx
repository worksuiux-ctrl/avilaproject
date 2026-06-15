import { Dialog, Badge, Table } from "@coe/design-system";
import { Button } from "@coe/design-system";
import type { LogEntry, LogType } from "../data/interfacesTypes";

const TYPE_LABEL: Record<LogType, string> = {
  success: "Éxito",
  business_error: "Error de negocio",
  syntax_error: "Error de sintaxis",
};

const TYPE_VARIANT: Record<LogType, "success" | "error" | "warning"> = {
  success: "success",
  business_error: "error",
  syntax_error: "warning",
};

interface LogsModalProps {
  open: boolean;
  onClose: () => void;
  interfaceName: string;
  logs: LogEntry[];
}

export function LogsModal({ open, onClose, interfaceName, logs }: LogsModalProps) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "timestamp", label: "Timestamp" },
    {
      key: "tipo",
      label: "Tipo",
      render: (row: LogEntry) => (
        <Badge variant={TYPE_VARIANT[row.tipo]} size="sm">
          {TYPE_LABEL[row.tipo]}
        </Badge>
      ),
    },
    { key: "archivo", label: "Archivo" },
    { key: "detalle", label: "Detalle" },
  ];

  return (
    <Dialog open={open} onClose={onClose} title={`Logs - ${interfaceName}`} size="lg">
      <div className="overflow-y-auto">
        <Table
          columns={columns}
          data={logs}
          pageSize={4}
        />
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Dialog>
  );
}
