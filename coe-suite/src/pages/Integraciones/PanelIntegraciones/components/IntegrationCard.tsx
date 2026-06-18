import { Card, Badge, Button } from "@coe/design-system";
import {
  Landmark, Map, Bell, FileInput, ShieldCheck, CalendarDays,
  Activity, Plug, FileText, Download,
} from "lucide-react";
import type { IntegrationItem, EstadoIntegracion } from "../data/integracionesTypes";

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark, Map, Bell, FileInput, ShieldCheck, CalendarDays,
};

const ESTADO_BADGE: Record<EstadoIntegracion, "success" | "error"> = {
  Activo: "success",
  Inactivo: "error",
};

const ESTADO_LABEL: Record<EstadoIntegracion, string> = {
  Activo: "Conectado",
  Inactivo: "Desconectado",
};

interface IntegrationCardProps {
  item: IntegrationItem;
  onTest: () => void;
  onMetrics: () => void;
  onLogs: () => void;
  onImport?: () => void;
}

export function IntegrationCard({ item, onTest, onMetrics, onLogs, onImport }: IntegrationCardProps) {
  const Icon = ICON_MAP[item.icon] || Plug;
  const badgeVariant = ESTADO_BADGE[item.estado];

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-2 rounded-corner-m shrink-0"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-darkgrey truncate">{item.nombre}</p>
            <p className="text-[11px] text-text-grey leading-small line-clamp-2">{item.descripcion}</p>
          </div>
        </div>
        <Badge variant={badgeVariant} size="sm" className="shrink-0">
          {ESTADO_LABEL[item.estado]}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5">
        <Badge variant="info" size="sm">
          {item.tipo}
        </Badge>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="ghost" size="sm" className="!text-[11px] flex-1" onClick={onMetrics}>
          <Activity className="w-3 h-3" /> Métricas
        </Button>
        <Button variant="outline" size="sm" className="!text-[11px] flex-1" onClick={onTest}>
          <Plug className="w-3 h-3" /> TEST
        </Button>
        <Button variant="secondary" size="sm" className="!text-[11px] flex-1" onClick={onLogs}>
          <FileText className="w-3 h-3" /> LOG
        </Button>
        {onImport && (
          <Button variant="primary" size="sm" className="!text-[11px] flex-1" onClick={onImport}>
            <Download className="w-3 h-3" /> Importar
          </Button>
        )}
      </div>
    </Card>
  );
}
