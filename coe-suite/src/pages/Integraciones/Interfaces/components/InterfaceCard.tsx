import { Card, Badge, Button, Switch } from "@coe/design-system";
import { Banknote, Shield, Calculator, Coins, Truck, RefreshCw, Cpu, Terminal, Upload, FileText } from "lucide-react";
import type { InterfaceItem, InterfaceStatus } from "../data/interfacesTypes";

const ICON_MAP: Record<string, React.ElementType> = { Banknote, Shield, Calculator, Coins, Truck, RefreshCw, Cpu, Terminal };

interface InterfaceCardProps {
  item: InterfaceItem;
  activa: boolean;
  onToggle: (checked: boolean) => void;
  onUpload: () => void;
  onLogs: () => void;
}

export function InterfaceCard({ item, activa, onToggle, onUpload, onLogs }: InterfaceCardProps) {
  const Icon = ICON_MAP[item.icon] || Terminal;
  const status: InterfaceStatus = activa ? "started" : "stopped";

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-corner-xs bg-ind-azul/10">
            <Icon className="w-4 h-4 text-ind-azul" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-darkgrey">{item.nombre}</p>
            <p className="text-[11px] text-text-grey leading-small">{item.descripcion}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge
          variant={status === "started" ? "success" : "error"}
          size="sm"
        >
          {status === "started" ? "Iniciada" : "Detenida"}
        </Badge>
        <Switch checked={activa} onChange={onToggle} />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="!text-[11px] flex-1" onClick={onUpload}>
          <Upload className="w-3 h-3" /> Cargar
        </Button>
        <Button variant="ghost" size="sm" className="!text-[11px] flex-1" onClick={onLogs}>
          <FileText className="w-3 h-3" /> Logs
        </Button>
      </div>
    </Card>
  );
}
