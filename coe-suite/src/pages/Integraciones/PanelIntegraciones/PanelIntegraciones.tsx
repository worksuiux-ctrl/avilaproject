import { useState, useMemo, useCallback, useEffect } from "react";
import { SearchBar, Heading, Text, Dialog, Button, Table, Badge } from "@coe/design-system";
import type { TableColumn } from "@coe/design-system";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, XCircle, Download } from "lucide-react";
import { IntegrationCard } from "./components/IntegrationCard";
import { MetricsModal } from "./components/MetricsModal";
import { CurrencyConfigModal } from "./components/CurrencyConfigModal";
import { INTEGRACIONES_MOCK } from "./data/integracionesMocks";
import { SUDEBAN_2026, type SudebanEntry } from "./data/sudeban2026";
import { importSudeban2026 } from "../../../services/sudebanCalendar";
import { useCalendarioStore } from "../../../stores/calendarioFinancieroStore";
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

  if (item.id === "int-sudeban") {
    return [];
  }

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
  const [importConfirm, setImportConfirm] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currencyConfigOpen, setCurrencyConfigOpen] = useState(false);
  const calendarioStore = useCalendarioStore();
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

  interface ImportResult {
    toAdd: SudebanEntry[];
    skipped: string[];
  }

  const handleImport = useCallback(() => {
    const configs = calendarioStore.configs.map((c) => ({ fecha: c.fecha, clasificacion: c.clasificacion, alcance: c.alcance }));
    const { toAdd, skipped } = importSudeban2026(configs);
    const item = INTEGRACIONES_MOCK.find((i) => i.id === "int-sudeban")!;

    for (const entry of toAdd) {
      calendarioStore.addConfig({
        fecha: entry.fecha,
        clasificacion: entry.clasificacion,
        descripcion: entry.descripcion,
        alcance: "todas",
        unidadesIds: [],
        gruposIds: [],
        finSemanaAplica: null,
        finSemanaRecurrencia: null,
        grupoId: null,
      });
    }

    const result: ImportResult = { toAdd, skipped };
    setImportResult(result);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const importLog: LogEntry = {
      ts,
      evento: "Importación SUDEBAN completada",
      detalle: `${toAdd.length} días importados, ${skipped.length} omitidos (ya existían)`,
    };

    setLogsState((prev) => ({
      ...prev,
      [item.id]: [importLog, ...(prev[item.id] || [])],
    }));

    if (toAdd.length > 0) {
      toast.success(`Calendario SUDEBAN 2026 importado`, {
        description: `${toAdd.length} día(s) configurado(s) · ${skipped.length} omitido(s)`,
      });
    } else {
      toast.info("Calendario SUDEBAN 2026 ya estaba importado", {
        description: "No se agregaron nuevos días. Todos los feriados ya estaban configurados.",
      });
    }

    setImportConfirm(false);
  }, [calendarioStore]);

  useEffect(() => {
    const sudebanItem = INTEGRACIONES_MOCK.find((i) => i.id === "int-sudeban");
    if (!sudebanItem || sudebanItem.estado !== "Activo") return;

    const doImport = () => {
      const state = useCalendarioStore.getState();
      const configs = state.configs.map((c) => ({ fecha: c.fecha, clasificacion: c.clasificacion, alcance: c.alcance }));
      const { toAdd } = importSudeban2026(configs);
      if (toAdd.length === 0) return;

      for (const entry of toAdd) {
        state.addConfig({
          fecha: entry.fecha,
          clasificacion: entry.clasificacion,
          descripcion: entry.descripcion,
          alcance: "todas",
          unidadesIds: [],
          gruposIds: [],
          finSemanaAplica: null,
          finSemanaRecurrencia: null,
          grupoId: null,
        });
      }

      const now = new Date();
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const ts = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

      setLogsState((prev) => ({
        ...prev,
        [sudebanItem.id]: [{
          ts,
          evento: "Importación automática SUDEBAN",
          detalle: `${toAdd.length} días cargados desde la integración conectada`,
        }, ...(prev[sudebanItem.id] || [])],
      }));
    };

    const unsub = useCalendarioStore.persist.onFinishHydration(doImport);
    if (useCalendarioStore.persist.hasHydrated()) {
      doImport();
    }
    return () => unsub();
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
                onImport={item.id === "int-sudeban" ? () => setImportConfirm(true) : undefined}
                onConfigurar={item.id === "int-divisas" ? () => setCurrencyConfigOpen(true) : undefined}
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

      {importConfirm && (
        <Dialog
          open
          onClose={() => setImportConfirm(false)}
          title="Importar Calendario SUDEBAN 2026"
          size="md"
        >
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--color-neutro-600)]">
              Se importarán los <strong>{SUDEBAN_2026.length} días</strong> del calendario bancario oficial SUDEBAN 2026.
              Los días se configurarán como <strong>"Todas las Unidades"</strong> en el Calendario Financiero.
            </p>
            <p className="text-[13px] text-[var(--color-neutro-600)]">
              Los días que ya estén configurados no se duplicarán.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setImportConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleImport}>
                <Download className="w-3.5 h-3.5" /> Importar
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      <CurrencyConfigModal
        open={currencyConfigOpen}
        onClose={() => setCurrencyConfigOpen(false)}
      />

      {importResult && (
        <Dialog
          open
          onClose={() => setImportResult(null)}
          title="Resultado de Importación"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutro-400)] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Importados
                </div>
                <span className="text-lg font-bold text-green-600">{importResult.toAdd.length}</span>
              </div>
              <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutro-400)] mb-1">
                  <XCircle className="w-3.5 h-3.5 text-amber-500" />
                  Omitidos
                </div>
                <span className="text-lg font-bold text-amber-600">{importResult.skipped.length}</span>
              </div>
            </div>

            {importResult.toAdd.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1">Días importados:</p>
                <div className="max-h-[180px] overflow-y-auto space-y-0.5">
                  {importResult.toAdd.map((e) => (
                    <div key={e.fecha} className="flex items-center gap-2 px-2 py-1 rounded-corner-m text-[12px] bg-green-50 text-green-700">
                      <CalendarDays className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{e.fecha}</span>
                      <span className="truncate">{e.descripcion}</span>
                      <Badge variant="success" size="sm" className="ml-auto shrink-0">{e.clasificacion}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.skipped.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1">Omitidos (ya existían):</p>
                <div className="max-h-[120px] overflow-y-auto space-y-0.5">
                  {importResult.skipped.map((s) => (
                    <div key={s} className="px-2 py-1 text-[12px] text-[var(--color-neutro-500)]">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
              <Button variant="secondary" size="sm" onClick={() => setImportResult(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
