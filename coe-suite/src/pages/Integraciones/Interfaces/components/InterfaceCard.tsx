import { Card, Badge, Button, Switch } from "@coe/design-system";
import {
  Banknote, Shield, Calculator, Coins, Truck, RefreshCw, Cpu, Terminal,
  Link, TrendingUp, Archive, Lock, DollarSign, Map, Layers, Briefcase,
  ClipboardCheck, Shuffle, UserCheck, ShieldAlert, Percent, Activity,
  Upload, FileText,
} from "lucide-react";
import type { InterfaceItem, InterfaceStatus } from "../data/interfacesTypes";

const ICON_MAP: Record<string, React.ElementType> = {
  Banknote, Shield, Calculator, Coins, Truck, RefreshCw, Cpu, Terminal,
  Link, TrendingUp, Archive, Lock, DollarSign, Map, Layers, Briefcase,
  ClipboardCheck, Shuffle, UserCheck, ShieldAlert, Percent, Activity,
};

const BADGE_VARIANT_MAP: Record<string, "info" | "success" | "warning"> = {
  Batch: "info",
  Online: "success",
  "Near Real-time": "warning",
};

const NO_UPLOAD_IDS = new Set([
  "int-orden-giro", "int-contabilidad", "int-terminal-financiero",
  "int-boveda-diaria", "int-contadoras", "int-anexo-monetario",
  "int-costo-diario", "int-atomo41", "int-contabilidad-contingencia",
  "int-movimiento-atm", "int-base24-comprobante", "int-base24-incdec",
]);

interface InterfaceCardProps {
  item: InterfaceItem;
  activa: boolean;
  onToggle: (checked: boolean) => void;
  onUpload: () => void;
  onLogs: () => void;
  onTest: () => void;
}

export function InterfaceCard({ item, activa, onToggle, onUpload, onLogs, onTest }: InterfaceCardProps) {
  const Icon = ICON_MAP[item.icon] || Terminal;
  const status: InterfaceStatus = activa ? "started" : "stopped";
  const badgeVariant = BADGE_VARIANT_MAP[item.tipoProcesamiento] || "info";
  const showUpload = !NO_UPLOAD_IDS.has(item.id);

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-corner-xs bg-ind-azul/10 shrink-0">
            <Icon className="w-4 h-4 text-ind-azul" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-darkgrey truncate">{item.nombre}</p>
            <p className="text-[11px] text-text-grey leading-small line-clamp-2">{item.descripcion}</p>
          </div>
        </div>
        <Badge variant={badgeVariant} size="sm" className="shrink-0">
          {item.tipoProcesamiento}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge
          variant={status === "started" ? "success" : "error"}
          size="sm"
        >
          {status === "started" ? "Iniciada" : "Detenida"}
        </Badge>
        <Switch checked={activa} onChange={onToggle} />
      </div>

      <div className="flex items-center gap-2">
        {showUpload && (
          <Button variant="outline" size="sm" className="!text-[11px] flex-1" onClick={onUpload}>
            <Upload className="w-3 h-3" /> Cargar
          </Button>
        )}
        <Button variant="ghost" size="sm" className="!text-[11px] flex-1" onClick={onLogs}>
          <FileText className="w-3 h-3" /> Logs
        </Button>
        <Button variant="secondary" size="sm" className="!text-[11px] flex-1" onClick={onTest}>
          <Activity className="w-3 h-3" /> TEST
        </Button>
      </div>
    </Card>
  );
}
