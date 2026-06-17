import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  CheckCircle,
  AlertTriangle,
  OctagonX,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  List,
  LayoutGrid,
  FileText,
  Shield,
  Plus,
  X,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import { Button, Badge } from "@coe/design-system";
import { useConteoStore, type ConteoRemesa, type ConteoBolsa, type ResultadoConteo } from "@stores/conteoStore";
import { useInstanciasStore } from "@stores/instanciasStore";
import { useTransaccionesStore } from "@stores/transaccionesStore";
import { useDivisasStore } from "@stores/divisasStore";

const RESULTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  incompleto: "Incompleto",
  faltante: "Faltante",
  sobrante: "Sobrante",
  inconsistente: "Inconsistente",
  en_proceso: "En Proceso",
};

const RESULTADO_ICON: Record<string, typeof CheckCircle> = {
  pendiente: Clock,
  confirmado: CheckCircle,
  incompleto: AlertTriangle,
  faltante: OctagonX,
  sobrante: AlertCircle,
  inconsistente: OctagonX,
  en_proceso: Clock,
};

const RESULTADO_COLOR: Record<string, string> = {
  pendiente: "bg-gray-100 text-gray-600 border-gray-300",
  confirmado: "bg-green-100 text-green-700 border-green-300",
  incompleto: "bg-amber-100 text-amber-700 border-amber-300",
  faltante: "bg-red-100 text-red-700 border-red-300",
  sobrante: "bg-blue-100 text-blue-700 border-blue-300",
  inconsistente: "bg-purple-100 text-purple-700 border-purple-300",
  en_proceso: "bg-blue-100 text-blue-700 border-blue-300",
};

export function MesaConteoPage() {
  const navigate = useNavigate();
  const { remesas, initializeConteo, actualizarBolsa, confirmarBolsa, cerrarRemesa } = useConteoStore();
  const { instancias, avanzarEstado } = useInstanciasStore();
  const { procesosFinalizados } = useTransaccionesStore();
  const divisasStore = useDivisasStore();
  const clasificaciones = divisasStore.clasificaciones;

  const [selectedRemesaId, setSelectedRemesaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [expandedBolsa, setExpandedBolsa] = useState<Record<string, boolean>>({});
  const [realValues, setRealValues] = useState<Record<string, Record<string, number>>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmCerrar, setConfirmCerrar] = useState<ConteoRemesa | null>(null);

  // Initialize conteo for instances in "En Conteo" state
  useEffect(() => {
    const enConteoInstancias = instancias.filter((i) => i.estadoActual === "demo-s-5b");
    for (const inst of enConteoInstancias) {
      const already = remesas.find((r) => r.instanciaId === inst.id);
      if (!already) {
        initializeConteo(inst.id);
      }
    }
  }, [instancias, remesas, initializeConteo]);

  const remesasEnConteo = useMemo(() => {
    const idsEnConteo = new Set(
      instancias.filter((i) => i.estadoActual === "demo-s-5b").map((i) => i.id)
    );
    const template = procesosFinalizados.find((p) => p.id === "demo-remesa-agencia");
    const confirmadoStep = template?.steps.find((s) => s.id === "demo-s-6");
    return remesas
      .filter((r) => idsEnConteo.has(r.instanciaId) || r.resultadoFinal !== "confirmado")
      .map((r) => ({
        ...r,
        bolsasContadas: r.bolsas.filter((b) => b.resultado !== "pendiente").length,
        totalBolsas: r.bolsas.length,
        confirmadoStepId: confirmadoStep?.id ?? "demo-s-6",
        confirmadoStepName: confirmadoStep?.nombre ?? "Confirmado",
      }));
  }, [remesas, instancias, procesosFinalizados]);

  const remesaSeleccionada = useMemo(() => {
    if (!selectedRemesaId) return null;
    return remesasEnConteo.find((r) => r.instanciaId === selectedRemesaId) ?? null;
  }, [selectedRemesaId, remesasEnConteo]);

  const filteredRemesas = useMemo(() => {
    if (!searchQuery.trim()) return remesasEnConteo;
    const q = searchQuery.toLowerCase();
    return remesasEnConteo.filter(
      (r) =>
        r.codigoRemesa.toLowerCase().includes(q) ||
        r.origenNombre.toLowerCase().includes(q) ||
        r.destinoNombre.toLowerCase().includes(q) ||
        r.templateName.toLowerCase().includes(q)
    );
  }, [remesasEnConteo, searchQuery]);

  // Select first remesa if none selected
  useEffect(() => {
    if (!selectedRemesaId && filteredRemesas.length > 0) {
      setSelectedRemesaId(filteredRemesas[0].instanciaId);
    }
  }, [filteredRemesas, selectedRemesaId]);

  // Initialize real values from conteo data
  useEffect(() => {
    if (!remesaSeleccionada) return;
    const vals: Record<string, Record<string, number>> = {};
    for (const bolsa of remesaSeleccionada.bolsas) {
      if (Object.keys(bolsa.denominacionesReales).length > 0) {
        vals[bolsa.bolsaId] = { ...bolsa.denominacionesReales };
      }
    }
    setRealValues((prev) => {
      const merged = { ...prev };
      for (const [k, v] of Object.entries(vals)) {
        merged[k] = v;
      }
      return merged;
    });
  }, [remesaSeleccionada?.instanciaId]);

  const handleRealChange = useCallback(
    (bolsaId: string, key: string, value: number) => {
      setRealValues((prev) => ({
        ...prev,
        [bolsaId]: { ...(prev[bolsaId] ?? {}), [key]: value },
      }));
    },
    []
  );

  const handleSaveBolsa = useCallback(
    (instanciaId: string, bolsaId: string) => {
      const vals = realValues[bolsaId] ?? {};
      const cleaned: Record<string, number> = {};
      for (const [k, v] of Object.entries(vals)) {
        if (v > 0) cleaned[k] = v;
      }
      actualizarBolsa(instanciaId, bolsaId, cleaned);
      setSuccessMsg("Conteo guardado");
      setTimeout(() => setSuccessMsg(""), 2000);
    },
    [realValues, actualizarBolsa]
  );

  const handleConfirmBolsa = useCallback(
    (instanciaId: string, bolsaId: string) => {
      const vals = realValues[bolsaId] ?? {};
      const cleaned: Record<string, number> = {};
      for (const [k, v] of Object.entries(vals)) {
        if (v > 0) cleaned[k] = v;
      }
      actualizarBolsa(instanciaId, bolsaId, cleaned);
      confirmarBolsa(instanciaId, bolsaId);
      setSuccessMsg("Bolsa confirmada");
      setTimeout(() => setSuccessMsg(""), 2000);
    },
    [realValues, actualizarBolsa, confirmarBolsa]
  );

  const handleCerrarRemesa = useCallback(() => {
    if (!remesaSeleccionada) return;
    cerrarRemesa(remesaSeleccionada.instanciaId);
    // Advance the instance to "Confirmado"
    avanzarEstado(
      remesaSeleccionada.instanciaId,
      remesaSeleccionada.confirmadoStepId,
      remesaSeleccionada.confirmadoStepName,
      "agencia",
      {},
      true
    );
    setConfirmCerrar(null);
    setSelectedRemesaId(null);
    setSuccessMsg(`Remesa ${remesaSeleccionada.codigoRemesa} cerrada`);
    setTimeout(() => setSuccessMsg(""), 3000);
  }, [remesaSeleccionada, cerrarRemesa, avanzarEstado]);

  const getBolsaResultColor = (r: ResultadoConteo) => {
    switch (r) {
      case "confirmado": return "var(--color-verde-100)";
      case "incompleto":
      case "faltante": return "#dc2626";
      case "sobrante": return "#2563eb";
      case "inconsistente": return "#9333ea";
      default: return "var(--color-neutro-400)";
    }
  };

  const totalEsperado = (bolsa: ConteoBolsa) => {
    return Object.values(bolsa.denominacionesEsperadas).reduce((s, v) => s + v, 0);
  };

  const totalReal = (bolsa: ConteoBolsa) => {
    const vals = realValues[bolsa.bolsaId] ?? bolsa.denominacionesReales;
    return Object.values(vals).reduce((s, v) => s + v, 0);
  };

  if (remesasEnConteo.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col">
        <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)] mb-1">Mesa de Conteo</h1>
        <p className="text-[13px] text-[var(--color-neutro-500)] mb-6">Conteo y verificación de remesas</p>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-corner-m bg-[var(--color-neutro-100)] flex items-center justify-center mb-4 mx-auto">
              <Package className="w-8 h-8 text-[var(--color-neutro-300)]" />
            </div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)] mb-1">No hay remesas en conteo</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)] mb-4">Las remesas aparecerán aquí cuando estén en estado "En Conteo"</p>
            <Button onClick={() => navigate("/operaciones")}>Ir a Operaciones</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {successMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="bg-[var(--color-verde-100)] border border-white rounded-2xl shadow-2xl px-12 py-10 text-center">
            <p className="text-[32px] font-bold text-white">{successMsg}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Mesa de Conteo</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">{remesasEnConteo.length} remesas en conteo</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
            <button
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === "list" ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
              onClick={() => setViewMode("list")}
              title="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === "cards" ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
              onClick={() => setViewMode("cards")}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" onClick={() => navigate("/operaciones")}>
            Volver a Operaciones
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left panel — list of remesas */}
        <div className="w-[340px] shrink-0 flex flex-col border border-[var(--color-neutro-200)] rounded-corner-m bg-white overflow-hidden">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutro-400)]" />
              <input
                className="w-full text-[12px] pl-7 pr-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                placeholder="Buscar remesa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredRemesas.map((r) => {
              const pct = r.totalBolsas > 0 ? Math.round((r.bolsasContadas / r.totalBolsas) * 100) : 0;
              const selected = r.instanciaId === selectedRemesaId;
              return (
                <button
                  key={r.instanciaId}
                  className={`w-full text-left px-3 py-3 border-b border-[var(--color-neutro-100)] transition-colors cursor-pointer hover:bg-[var(--color-neutro-50)] ${selected ? "bg-[var(--color-verde-100)]/5 border-l-2 border-l-[var(--color-verde-100)]" : ""}`}
                  onClick={() => setSelectedRemesaId(r.instanciaId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[var(--color-neutro-900)] truncate">
                        {r.codigoRemesa || "Sin código"}
                      </p>
                      <p className="text-[11px] text-[var(--color-neutro-500)] mt-0.5">
                        {r.origenNombre} <ArrowRight className="w-2.5 h-2.5 inline" /> {r.destinoNombre}
                      </p>
                    </div>
                    <Badge
                      variant={r.bolsasContadas === r.totalBolsas ? "success" : "warning"}
                      size="sm"
                    >
                      {r.bolsasContadas}/{r.totalBolsas}
                    </Badge>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-[var(--color-neutro-100)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-[var(--color-verde-100)]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {r.totalBolsas > 0 && (
                    <p className="text-[10px] text-[var(--color-neutro-400)] mt-1">{pct}% completado</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel — workbench */}
        <div className="flex-1 flex flex-col min-w-0">
          {remesaSeleccionada ? (
            <div className="flex flex-col min-h-0 flex-1">
              {/* Remesa header */}
              <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-[var(--color-neutro-400)]" />
                      <h2 className="text-[16px] font-bold text-[var(--color-neutro-900)]">
                        {remesaSeleccionada.codigoRemesa || "Remesa sin código"}
                      </h2>
                      <Badge variant="warning" size="sm">En Conteo</Badge>
                    </div>
                    <p className="text-[12px] text-[var(--color-neutro-500)]">
                      {remesaSeleccionada.templateName} — {remesaSeleccionada.origenNombre} → {remesaSeleccionada.destinoNombre}
                    </p>
                    <p className="text-[11px] text-[var(--color-neutro-400)] mt-0.5">
                      {remesaSeleccionada.divisaCodigo} · Inicio: {remesaSeleccionada.fechaInicio}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[var(--color-neutro-500)]">
                      {remesaSeleccionada.bolsasContadas}/{remesaSeleccionada.totalBolsas} bolsas
                    </span>
                    {remesaSeleccionada.totalBolsas > 0 && remesaSeleccionada.bolsasContadas === remesaSeleccionada.totalBolsas && (
                      <Button onClick={() => setConfirmCerrar(remesaSeleccionada)}>
                        Cerrar Remesa
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bolsas list */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {remesaSeleccionada.bolsas.length === 0 && (
                  <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-8 text-center">
                    <Package className="w-10 h-10 text-[var(--color-neutro-300)] mx-auto mb-3" />
                    <p className="text-[13px] text-[var(--color-neutro-500)]">
                      Esta remesa no tiene bolsas/envases registrados para conteo
                    </p>
                  </div>
                )}

                {remesaSeleccionada.bolsas.map((bolsa) => {
                  const expanded = expandedBolsa[bolsa.bolsaId] ?? false;
                  const espEntries = Object.entries(bolsa.denominacionesEsperadas).filter(([, v]) => v > 0);
                  const vals = realValues[bolsa.bolsaId] ?? {};
                  const hasRealInput = Object.values(vals).some((v) => v > 0);
                  const bolsaResult = bolsa.resultado;
                  const isPendiente = bolsaResult === "pendiente";
                  const totalEsp = totalEsperado(bolsa);
                  const totalRealV = totalReal(bolsa);
                  const claColor = bolsa.clasificacionColor;

                  return (
                    <div
                      key={bolsa.bolsaId}
                      className="border border-[var(--color-neutro-200)] border-l-2 rounded-corner-m bg-white shadow-sm overflow-hidden"
                      style={{ borderLeftColor: bolsaResult === "confirmado" ? "var(--color-verde-100)" : isPendiente ? claColor : getBolsaResultColor(bolsaResult) }}
                    >
                      {/* Bolsa header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[var(--color-neutro-50)] to-white border-b border-[var(--color-neutro-200)]">
                        {expanded ? (
                          <button
                            onClick={() => setExpandedBolsa((prev) => ({ ...prev, [bolsa.bolsaId]: false }))}
                            className="p-0.5 hover:bg-[var(--color-neutro-200)] rounded cursor-pointer"
                          >
                            <ChevronDown className="w-4 h-4 text-[var(--color-neutro-400)]" />
                          </button>
                        ) : (
                          <div className="w-4 h-4 shrink-0" />
                        )}
                        <div className="flex items-center gap-2 shrink-0">
                          <Package className={`w-4 h-4 ${bolsaResult === "confirmado" ? "text-green-500" : "text-[var(--color-neutro-400)]"}`} />
                          <span className="text-[14px] font-bold text-[var(--color-neutro-800)]">
                            {bolsa.codigoBolsa || "Bolsa"}
                          </span>
                        </div>
                        {bolsa.clasificacionNombre && (
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: claColor }}
                          >
                            {bolsa.clasificacionNombre}
                          </span>
                        )}
                        {bolsa.precinto && (
                          <span className="text-[10px] font-mono text-[var(--color-neutro-400)]">
                            Precinto: {bolsa.precinto}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          {!isPendiente && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${RESULTADO_COLOR[bolsaResult] ?? ""}`}>
                              {RESULTADO_LABEL[bolsaResult]}
                            </span>
                          )}
                          {!expanded && !isPendiente && (
                            <span className="text-[11px] text-[var(--color-neutro-400)]">
                              Esp: {totalEsp} · Real: {totalRealV}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* "Abrir Bolsa" call-to-action when collapsed and pending */}
                      {!expanded && isPendiente && (
                        <button
                          onClick={() => setExpandedBolsa((prev) => ({ ...prev, [bolsa.bolsaId]: true }))}
                          className="w-full flex items-center justify-center gap-2 px-4 py-5 text-[14px] font-semibold text-[var(--color-verde-100)] hover:bg-green-50 transition-colors cursor-pointer border-b border-[var(--color-neutro-100)]"
                        >
                          <Package className="w-5 h-5" />
                          Abrir Bolsa
                          <span className="text-[12px] font-normal text-[var(--color-neutro-400)] ml-1">
                            — {totalEsp} unidades esperadas
                          </span>
                        </button>
                      )}

                      {expanded && (
                        <div className="p-4">
                          {/* Denominations table */}
                          {espEntries.length > 0 ? (
                            <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden mb-3">
                              <table className="w-full text-[12px]">
                                <thead>
                                  <tr className="bg-[var(--color-neutro-50)]">
                                    <th className="text-left px-3 py-2 font-semibold text-[var(--color-neutro-600)]">Denominación</th>
                                    <th className="text-right px-3 py-2 font-semibold text-[var(--color-neutro-600)]">Esperado</th>
                                    <th className="text-right px-3 py-2 font-semibold text-[var(--color-neutro-600)]">Real</th>
                                    <th className="text-right px-3 py-2 font-semibold text-[var(--color-neutro-600)]">Diferencia</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {espEntries.map(([key, esp]) => {
                                    const real = vals[key] ?? 0;
                                    const diff = real - esp;
                                    return (
                                      <tr key={key} className="border-t border-[var(--color-neutro-100)]">
                                        <td className="px-3 py-2 text-[var(--color-neutro-800)] font-medium">{key}</td>
                                        <td className="px-3 py-2 text-right text-[var(--color-neutro-700)]">{esp.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-right">
                                          <input
                                            type="number"
                                            min={0}
                                            value={real || ""}
                                            onChange={(e) => handleRealChange(bolsa.bolsaId, key, Math.max(0, parseInt(e.target.value) || 0))}
                                            className={`w-24 text-[16px] font-bold text-right px-3 py-1.5 rounded-md border outline-none bg-white ${
                                              diff !== 0 && real > 0
                                                ? "border-amber-400 ring-1 ring-amber-200"
                                                : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"
                                            }`}
                                            placeholder="0"
                                            disabled={!isPendiente}
                                          />
                                        </td>
                                        <td className={`px-3 py-2 text-right font-semibold ${diff === 0 ? "text-[var(--color-neutro-400)]" : diff > 0 ? "text-blue-600" : "text-red-600"}`}>
                                          {isPendiente && real > 0 ? (diff > 0 ? `+${diff}` : diff === 0 ? "0" : `${diff}`) : "—"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)]">
                                    <td className="px-3 py-2 font-bold text-[var(--color-neutro-800)]">Total</td>
                                    <td className="px-3 py-2 text-right font-bold text-[var(--color-neutro-700)]">{totalEsp.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-bold text-[var(--color-neutro-900)]">
                                      {totalRealV > 0 ? totalRealV.toLocaleString() : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold">
                                      {totalRealV > 0 ? (
                                        <span className={totalRealV === totalEsp ? "text-green-600" : totalRealV > totalEsp ? "text-blue-600" : "text-red-600"}>
                                          {totalRealV > totalEsp ? `+${(totalRealV - totalEsp).toLocaleString()}` : totalRealV < totalEsp ? (totalRealV - totalEsp).toLocaleString() : "0"}
                                        </span>
                                      ) : "—"}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          ) : (
                            <p className="text-[12px] text-[var(--color-neutro-400)] mb-3 italic">
                              Sin denominaciones esperadas
                            </p>
                          )}

                          {/* Observaciones */}
                          {!isPendiente && bolsa.observaciones && (
                            <div className="mb-3 px-3 py-2 rounded-corner-m bg-[var(--color-neutro-50)]">
                              <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase">Observaciones</p>
                              <p className="text-[12px] text-[var(--color-neutro-700)]">{bolsa.observaciones}</p>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            {isPendiente && (
                              <>
                                <Button
                                  variant="outline"
                                  iconLeft={<CheckCheck className="w-3.5 h-3.5" />}
                                  onClick={() => handleSaveBolsa(remesaSeleccionada.instanciaId, bolsa.bolsaId)}
                                  disabled={!hasRealInput}
                                >
                                  Guardar Conteo
                                </Button>
                                <Button
                                  iconLeft={<CheckCircle className="w-3.5 h-3.5" />}
                                  onClick={() => handleConfirmBolsa(remesaSeleccionada.instanciaId, bolsa.bolsaId)}
                                  disabled={!hasRealInput}
                                >
                                  Confirmar Bolsa
                                </Button>
                              </>
                            )}
                            {bolsa.fechaConteo && (
                              <span className="text-[10px] text-[var(--color-neutro-400)] ml-auto">
                                Contado: {bolsa.fechaConteo}{bolsa.contadoPor ? ` por ${bolsa.contadoPor}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Package className="w-12 h-12 text-[var(--color-neutro-300)] mx-auto mb-3" />
                <p className="text-[14px] text-[var(--color-neutro-500)]">Seleccione una remesa para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cerrar remesa confirmation */}
      {confirmCerrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmCerrar(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-bold text-[var(--color-neutro-900)] mb-2">Cerrar Remesa</p>
            <p className="text-[12px] text-[var(--color-neutro-600)] mb-4">
              Se cerrará <strong>{confirmCerrar.codigoRemesa}</strong> y avanzará al estado Confirmado.
              {confirmCerrar.bolsas.some((b) => b.resultado !== "confirmado") && (
                <span className="block mt-2 text-amber-600">
                  ⚠ Hay bolsas con discrepancias. Se generarán los saldos de devolución correspondientes.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmCerrar(null)}>Cancelar</Button>
              <Button onClick={handleCerrarRemesa}>Cerrar Remesa</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
