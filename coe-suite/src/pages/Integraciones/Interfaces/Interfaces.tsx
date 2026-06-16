import { useState, useMemo, useCallback } from "react";
import { SearchBar, Heading, Text } from "@coe/design-system";
import { toast } from "sonner";
import { InterfaceCard } from "./components/InterfaceCard";
import { ToggleConfirmModal } from "./components/ToggleConfirmModal";
import { FileUploadModal } from "./components/FileUploadModal";
import { LogsModal } from "./components/LogsModal";
import { INTERFACES_MOCK, LOGS_MOCK } from "./data/interfacesMocks";
import type { InterfaceItem, LogEntry } from "./data/interfacesTypes";

export function Interfaces() {
  const [search, setSearch] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const item of INTERFACES_MOCK) {
      map[item.id] = item.status === "started";
    }
    return map;
  });

  const [logsState, setLogsState] = useState<Record<string, LogEntry[]>>(() => {
    const clone: Record<string, LogEntry[]> = {};
    for (const [key, entries] of Object.entries(LOGS_MOCK)) {
      clone[key] = [...entries];
    }
    return clone;
  });

  const [toggleTarget, setToggleTarget] = useState<{ item: InterfaceItem; newStatus: boolean } | null>(null);
  const [uploadTarget, setUploadTarget] = useState<InterfaceItem | null>(null);
  const [logsTarget, setLogsTarget] = useState<InterfaceItem | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return INTERFACES_MOCK;
    const q = search.toLowerCase();
    return INTERFACES_MOCK.filter((item) =>
      item.nombre.toLowerCase().includes(q) || item.descripcion.toLowerCase().includes(q)
    );
  }, [search]);

  const handleToggleConfirm = () => {
    if (!toggleTarget) return;
    setStatusMap((prev) => ({ ...prev, [toggleTarget.item.id]: toggleTarget.newStatus }));
    setToggleTarget(null);
  };

  const handleTest = useCallback((item: InterfaceItem) => {
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").substring(0, 19);
    const entry: LogEntry = {
      id: `L-TEST-${Date.now()}`,
      timestamp: ts,
      tipo: "success",
      archivo: "-",
      detalle: `Test de conectividad exitoso con el Core Bancario.`,
    };
    setLogsState((prev) => ({
      ...prev,
      [item.id]: [entry, ...(prev[item.id] || [])],
    }));
    toast.success(`Test de conectividad exitoso con la interfaz ${item.nombre}`, {
      description: "Conexión con el Core Bancario verificada correctamente.",
    });
    setLogsTarget(item);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <Heading variant="title" as="h1">Interfaces</Heading>
          <Text variant="small" className="text-text-grey mt-1">
            Panel de control de interfaces — monitoreo, diagnóstico y consulta de logs
          </Text>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar interfaz por nombre o descripción..."
          className="w-full"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-grey">
            <Text variant="body">No se encontraron interfaces</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <InterfaceCard
                key={item.id}
                item={item}
                activa={statusMap[item.id]}
                onToggle={(checked) => setToggleTarget({ item, newStatus: checked })}
                onUpload={() => setUploadTarget(item)}
                onLogs={() => setLogsTarget(item)}
                onTest={() => handleTest(item)}
              />
            ))}
          </div>
        )}
      </div>

      {toggleTarget && (
        <ToggleConfirmModal
          open
          onClose={() => setToggleTarget(null)}
          onConfirm={handleToggleConfirm}
          interfaceName={toggleTarget.item.nombre}
          newStatus={toggleTarget.newStatus ? "started" : "stopped"}
        />
      )}

      {uploadTarget && (
        <FileUploadModal
          open
          onClose={() => setUploadTarget(null)}
          interfaceName={uploadTarget.nombre}
          formato={uploadTarget.formato}
        />
      )}

      {logsTarget && (
        <LogsModal
          open
          onClose={() => setLogsTarget(null)}
          interfaceName={logsTarget.nombre}
          logs={logsState[logsTarget.id] || []}
        />
      )}
    </div>
  );
}
