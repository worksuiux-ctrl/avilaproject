import { useState, useMemo, useCallback } from "react";
import { SearchBar, Heading, Text, Dialog, Button, Table } from "@coe/design-system";
import type { TableColumn } from "@coe/design-system";
import { toast } from "sonner";
import { IntegrationCard } from "./components/IntegrationCard";
import { MetricsModal } from "./components/MetricsModal";
import { INTEGRACIONES_MOCK } from "./data/integracionesMocks";
import type { IntegrationItem } from "./data/integracionesTypes";

interface LogEntry {
  ts: string;
  evento: string;
  detalle: string;
}

const LOG_COLUMNS: TableColumn[] = [
  { key: "ts", label: "Timestamp" },
  { key: "evento", label: "Evento" },
  { key: "detalle", label: "Detalle" },
];

function buildBaseLogs(item: IntegrationItem): LogEntry[] {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts = (h: number, m: number) =>
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(h)}:${pad(m)}:00`;

  const base: LogEntry[] = [
    { ts: ts(6, 15), evento: "Conexión establecida", detalle: `Handshake completado con ${item.nombre}` },
    { ts: ts(7, 0), evento: "Sincronización exitosa", detalle: "Datos recibidos correctamente (0 errores)" },
  ];

  if (item.estado === "Inactivo") {
    base.unshift(
      { ts: ts(0, 0), evento: "Conexión fallida", detalle: "Endpoint sin respuesta — timeout 30s" },
      { ts: ts(23, 55), evento: "Servicio detenido", detalle: "Integración marcada como inactiva por el administrador" },
    );
  } else {
    base.push(
      { ts: ts(8, 30), evento: "Heartbeat OK", detalle: "Latencia 8ms — estado del servicio: saludable" },
      { ts: ts(10, 0), evento: "Transferencia de datos", detalle: "1,250 registros procesados" },
      { ts: ts(11, 45), evento: "Heartbeat OK", detalle: "Latencia 12ms — estado del servicio: saludable" },
    );
  }
  return base;
}

export function PanelIntegraciones() {
  const [search, setSearch] = useState("");
  const [logsTarget, setLogsTarget] = useState<IntegrationItem | null>(null);
  const [metricsTarget, setMetricsTarget] = useState<IntegrationItem | null>(null);
  const [logsState, setLogsState] = useState<Record<string, LogEntry[]>>(() => {
    const map: Record<string, LogEntry[]> = {};
    for (const item of INTEGRACIONES_MOCK) {
      map[item.id] = buildBaseLogs(item);
    }
    return map;
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return INTEGRACIONES_MOCK;
    const q = search.toLowerCase();
    return INTEGRACIONES_MOCK.filter(
      (item) =>
        item.nombre.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        item.tipo.toLowerCase().includes(q)
    );
  }, [search]);

  const handleTest = useCallback((item: IntegrationItem) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const entry: LogEntry = {
      ts,
      evento: "Test de conectividad",
      detalle:
        item.estado === "Activo"
          ? "Diagnóstico exitoso — Latencia: 12ms · Paquetes: 4/4 · Handshake OK"
          : "Diagnóstico fallido — Servicio no disponible. Verifique la configuración del endpoint.",
    };

    setLogsState((prev) => ({
      ...prev,
      [item.id]: [entry, ...(prev[item.id] || [])],
    }));

    toast.success(`Diagnóstico de conexión — ${item.nombre}`, {
      description: item.estado === "Activo"
        ? "Latencia: 12ms · Paquetes: 4/4 · Handshake OK"
        : "Servicio no disponible. Verifique la configuración del endpoint.",
    });

    setLogsTarget(item);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <Heading variant="title" as="h1">Panel de Integraciones</Heading>
          <Text variant="small" className="text-text-grey mt-1">
            Conexiones externas — monitoreo, diagnóstico y auditoría de servicios
          </Text>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar integración por nombre, descripción o tipo..."
          className="w-full"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-grey">
            <Text variant="body">No se encontraron integraciones</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <IntegrationCard
                key={item.id}
                item={item}
                onTest={() => handleTest(item)}
                onMetrics={() => setMetricsTarget(item)}
                onLogs={() => setLogsTarget(item)}
              />
            ))}
          </div>
        )}
      </div>

      {logsTarget && (
        <Dialog
          open
          onClose={() => setLogsTarget(null)}
          title={`Logs — ${logsTarget.nombre}`}
          size="lg"
        >
          <Table
            columns={LOG_COLUMNS}
            data={logsState[logsTarget.id] || []}
            pageSize={5}
          />
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--color-neutro-200)]">
            <Button variant="outline" size="sm" onClick={() => setLogsTarget(null)}>
              Cerrar
            </Button>
          </div>
        </Dialog>
      )}

      {metricsTarget && (
        <MetricsModal
          open
          onClose={() => setMetricsTarget(null)}
          item={metricsTarget}
        />
      )}
    </div>
  );
}
