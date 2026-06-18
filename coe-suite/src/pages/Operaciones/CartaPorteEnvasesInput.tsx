import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Package, ChevronDown, ChevronRight, AlertCircle, FileText, Shield, Truck } from "lucide-react";
import { SearchableSelect } from "@components/ui/SearchableSelect";
import type { ClasificacionBatch } from "./EnvasesInput";

interface EnvaseRow {
  id: string;
  envase: string;
  precinto: string;
  clasificacionId: string;
  denominaciones: Record<string, number>;
}

interface CartaPorteGroup {
  id: string;
  cartaPorte: string;
  envases: EnvaseRow[];
  collapsed: boolean;
}

interface CartaPorteEnvasesInputProps {
  value: string;
  onChange: (value: string) => void;
  batchData?: ClasificacionBatch[];
  clasificaciones?: { id: string; nombre: string; color: string }[];
}

let cpIdCounter = 0;
let envIdCounter = 0;

function makeCpId() { return `cp-${++cpIdCounter}`; }
function makeEnvId() { return `cpenv-${++envIdCounter}`; }

function parseValue(v: string): CartaPorteGroup[] {
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) {
      return parsed.map((g: any) => ({
        id: g.id ?? makeCpId(),
        cartaPorte: g.cartaPorte ?? "",
        envases: (g.envases ?? []).map((e: any) => ({
          id: e.id ?? makeEnvId(),
          envase: e.envase ?? "",
          precinto: e.precinto ?? "",
          clasificacionId: e.clasificacionId ?? "",
          denominaciones: e.denominaciones ?? {},
        })),
        collapsed: g.collapsed ?? false,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

function formatNum(n: number): string {
  return n.toLocaleString("es-VE");
}

export function CartaPorteEnvasesInput({ value, onChange, batchData, clasificaciones }: CartaPorteEnvasesInputProps) {
  const hasDenominaciones = batchData && batchData.length > 0 && batchData.some((b) => b.items.some((i) => i.cantidad > 0));
  const activeBatch = (batchData ?? []).filter((b) => b.items.some((i) => i.cantidad > 0));

  const [groups, setGroups] = useState<CartaPorteGroup[]>(() => {
    const parsed = parseValue(value);
    if (parsed.length > 0) return parsed;
    return [];
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && groups.length > 0 && !value) {
      initialized.current = true;
      onChange(JSON.stringify(stripIds(groups)));
    }
  }, []);

  useEffect(() => {
    const parsed = parseValue(value);
    if (parsed.length > 0 && JSON.stringify(parsed.map((g) => g.id)) !== JSON.stringify(groups.map((g) => g.id))) {
      setGroups(parsed);
    }
  }, [value]);

  function stripIds(g: CartaPorteGroup[]) {
    return g.map((grp) => ({
      id: grp.id,
      cartaPorte: grp.cartaPorte,
      envases: grp.envases.map((e) => ({
        id: e.id,
        envase: e.envase,
        precinto: e.precinto,
        clasificacionId: hasDenominaciones ? e.clasificacionId : undefined,
        denominaciones: hasDenominaciones ? e.denominaciones : undefined,
      })),
      collapsed: grp.collapsed,
    }));
  }

  function updateGroups(newGroups: CartaPorteGroup[]) {
    setGroups(newGroups);
    onChange(JSON.stringify(stripIds(newGroups)));
  }

  function addGroup() {
    updateGroups([...groups, { id: makeCpId(), cartaPorte: "", envases: [{ id: makeEnvId(), envase: "", precinto: "", clasificacionId: activeBatch[0]?.clasificacionId ?? "", denominaciones: {} }], collapsed: false }]);
  }

  function removeGroup(id: string) {
    updateGroups(groups.filter((g) => g.id !== id));
  }

  function toggleCollapse(id: string) {
    updateGroups(groups.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g)));
  }

  function updateCartaPorte(id: string, val: string) {
    updateGroups(groups.map((g) => (g.id === id ? { ...g, cartaPorte: val } : g)));
  }

  function addEnvase(groupId: string) {
    updateGroups(groups.map((g) =>
      g.id === groupId ? { ...g, envases: [...g.envases, { id: makeEnvId(), envase: "", precinto: "", clasificacionId: activeBatch[0]?.clasificacionId ?? "", denominaciones: {} }] } : g,
    ));
  }

  function removeEnvase(groupId: string, envId: string) {
    updateGroups(groups.map((g) =>
      g.id === groupId ? { ...g, envases: g.envases.filter((e) => e.id !== envId) } : g,
    ));
  }

  function updateEnvaseField(groupId: string, envId: string, field: "envase" | "precinto" | "clasificacionId", val: string) {
    updateGroups(groups.map((g) =>
      g.id === groupId
        ? { ...g, envases: g.envases.map((e) => (e.id === envId ? { ...e, [field]: val, denominaciones: field === "clasificacionId" ? {} : e.denominaciones } : e)) }
        : g,
    ));
  }

  function updateDenom(groupId: string, envId: string, label: string, qty: number) {
    updateGroups(groups.map((g) =>
      g.id === groupId
        ? { ...g, envases: g.envases.map((e) =>
            e.id === envId ? { ...e, denominaciones: { ...e.denominaciones, [label]: Math.max(0, qty || 0) } } : e,
          ) }
        : g,
    ));
  }

  // Validation
  const allCartaPortes = groups.map((g) => g.cartaPorte.trim()).filter(Boolean);
  const dupCartaPortes = new Set(allCartaPortes.filter((v, i, a) => a.indexOf(v) !== i));

  const allEnvaseNums = groups.flatMap((g) => g.envases.map((e) => e.envase.trim())).filter(Boolean);
  const dupEnvases = new Set(allEnvaseNums.filter((v, i, a) => a.indexOf(v) !== i));

  const allPrecintos = groups.flatMap((g) => g.envases.map((e) => e.precinto.trim())).filter(Boolean);
  const dupPrecintos = new Set(allPrecintos.filter((v, i, a) => a.indexOf(v) !== i));

  // Denomination totals per clasificación (full mode)
  function totalPerDenom(clasificacionId: string, label: string): number {
    return groups.flatMap((g) => g.envases)
      .filter((e) => e.clasificacionId === clasificacionId)
      .reduce((s, e) => s + (e.denominaciones[label] ?? 0), 0);
  }

  function getBatch(clasificacionId: string) {
    return activeBatch.find((b) => b.clasificacionId === clasificacionId);
  }

  function remaining(clasificacionId: string, label: string): number {
    const batch = getBatch(clasificacionId);
    const item = batch?.items.find((i) => i.nombre === label);
    if (!item) return 0;
    return item.cantidad - totalPerDenom(clasificacionId, label);
  }

  const allValid = activeBatch.every((b) => b.items.every((i) => remaining(b.clasificacionId, i.nombre) >= 0));

  return (
    <div className="space-y-3">
      {groups.map((g, gi) => {
        const cpDup = g.cartaPorte.trim() && dupCartaPortes.has(g.cartaPorte.trim());
        return (
          <div key={g.id} className="border border-[var(--color-neutro-200)] rounded-lg bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--color-neutro-50)] to-white border-b border-[var(--color-neutro-200)] cursor-pointer select-none"
              onClick={() => toggleCollapse(g.id)}
            >
              <button type="button" className="p-0.5 hover:bg-[var(--color-neutro-100)] rounded transition-colors">
                {g.collapsed ? <ChevronRight className="w-4 h-4 text-[var(--color-neutro-400)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-neutro-400)]" />}
              </button>
              <FileText className="w-4 h-4 text-[var(--color-neutro-400)] shrink-0" />
              <span className="text-[13px] font-bold text-[var(--color-neutro-700)] shrink-0">Carta porte #{gi + 1}</span>
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  value={g.cartaPorte}
                  onChange={(e) => updateCartaPorte(g.id, e.target.value)}
                  className={`text-[14px] px-3 py-1.5 rounded-md border outline-none bg-white w-56 font-medium ${cpDup ? "border-red-400 ring-1 ring-red-200" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                  placeholder="N° de carta porte"
                />
              </div>
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-500 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }}
                title="Eliminar carta porte"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            {!g.collapsed && (
              <div className="px-4 py-3 space-y-4">
                {g.envases.map((e, ei) => {
                  const cla = clasificaciones?.find((c) => c.id === e.clasificacionId);
                  const batch = getBatch(e.clasificacionId);
                  return (
                    <div key={e.id} className="border border-[var(--color-neutro-200)] border-l-2 rounded-lg bg-white shadow-sm overflow-hidden" style={cla ? { borderLeftColor: cla.color } : undefined}>
                      {/* Envase header */}
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[var(--color-neutro-50)] to-white border-b border-[var(--color-neutro-200)]">
                        <Package className="w-4 h-4 text-[var(--color-neutro-400)]" />
                        <span className="text-[12px] font-bold text-[var(--color-neutro-700)] shrink-0">Envase #{ei + 1}</span>
                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[8px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">N° Envase</label>
                            <input
                              value={e.envase}
                              onChange={(ev) => updateEnvaseField(g.id, e.id, "envase", ev.target.value)}
                              className={`text-[13px] px-3 py-1.5 rounded-md border outline-none bg-white w-28 font-medium ${dupEnvases.has(e.envase.trim()) ? "border-red-400 ring-1 ring-red-200" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                              placeholder="Ej: ENV-001"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[8px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">N° Precinto</label>
                            <input
                              value={e.precinto}
                              onChange={(ev) => updateEnvaseField(g.id, e.id, "precinto", ev.target.value)}
                              className={`text-[13px] px-3 py-1.5 rounded-md border outline-none bg-white w-28 font-medium ${dupPrecintos.has(e.precinto.trim()) ? "border-red-400 ring-1 ring-red-200" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                              placeholder="Ej: PREC-001"
                            />
                          </div>
                          {hasDenominaciones && activeBatch.length > 1 && (
                            <div className="flex flex-col gap-0.5 min-w-[160px]">
                              <label className="text-[8px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">Clasificación</label>
                              <SearchableSelect
                                options={activeBatch.map((b) => ({ value: b.clasificacionId, label: b.clasificacionNombre ?? "Sin nombre" }))}
                                value={e.clasificacionId}
                                onChange={(v) => updateEnvaseField(g.id, e.id, "clasificacionId", v)}
                                placeholder="Seleccionar..."
                                searchPlaceholder="Buscar..."
                              />
                            </div>
                          )}
                          {hasDenominaciones && activeBatch.length <= 1 && cla && (
                            <div className="flex items-center gap-1.5 ml-1 mt-4">
                              <span className="text-[12px] font-medium text-[var(--color-neutro-600)]">{cla.nombre}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="p-1 rounded-md hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-500 transition-colors cursor-pointer mt-4"
                          onClick={() => removeEnvase(g.id, e.id)}
                          title="Eliminar envase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Denomination distribution (full mode) */}
                      {hasDenominaciones && batch && batch.items.some((i) => i.cantidad > 0) && (
                        <div className="px-4 py-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                            <p className="text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Distribución de fajos</p>
                          </div>
                          <div className="space-y-1.5">
                            {batch.items.map((item) => {
                              const qty = e.denominaciones[item.nombre] ?? 0;
                              const disp = item.cantidad - (totalPerDenom(e.clasificacionId, item.nombre) - qty);
                              const over = qty > disp;
                              return item.cantidad > 0 ? (
                                <div key={item.nombre} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-neutro-50)] transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[13px] font-medium text-[var(--color-neutro-800)]">{item.nombre}</span>
                                    <span className="text-[11px] text-[var(--color-neutro-400)] ml-2">
                                      {item.valor > 0 && <span className="font-semibold text-[var(--color-verde-100)]">${formatNum(item.valor)}</span>}
                                      {item.cantidadBilletes && item.cantidadBilletes > 1 ? ` × ${item.cantidadBilletes} billetes` : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex flex-col items-end">
                                      <input
                                        type="number"
                                        min={0}
                                        value={qty}
                                        onChange={(ev) => updateDenom(g.id, e.id, item.nombre, parseInt(ev.target.value) || 0)}
                                        className={`w-24 text-[16px] font-bold text-right px-3 py-1.5 rounded-md border outline-none bg-white ${over ? "border-red-400 ring-1 ring-red-200 text-red-600" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="flex flex-col items-start min-w-[80px]">
                                      <span className={`text-[10px] ${disp > 0 ? "text-[var(--color-neutro-400)]" : "text-green-600 font-semibold"}`}>disponible</span>
                                      <span className={`text-[13px] font-bold ${disp > 0 ? "text-[var(--color-neutro-600)]" : "text-green-600"}`}>{formatNum(disp)}</span>
                                    </div>
                                    {qty > 0 && (
                                      <div className="flex flex-col items-start min-w-[60px]">
                                        <span className="text-[10px] text-[var(--color-verde-100)]">asignado</span>
                                        <span className="text-[13px] font-bold text-[var(--color-verde-100)]">{formatNum(qty)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      {hasDenominaciones && (!batch || !batch.items.some((i) => i.cantidad > 0)) && (
                        <div className="px-4 py-3">
                          <p className="text-[12px] text-[var(--color-neutro-400)] italic flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            No hay denominaciones disponibles para esta clasificación.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md border border-dashed border-[var(--color-neutro-300)] text-[var(--color-neutro-500)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-green-50/50 bg-white transition-colors cursor-pointer"
                  onClick={() => addEnvase(g.id)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar envase
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-lg border-2 border-dashed border-[var(--color-neutro-300)] text-[var(--color-neutro-500)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-green-50/50 bg-white transition-colors cursor-pointer w-full justify-center"
        onClick={addGroup}
      >
        <Plus className="w-4 h-4" />
        Agregar carta porte
      </button>

      {groups.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)]">
          <FileText className="w-4 h-4 text-[var(--color-neutro-400)]" />
          <p className="text-[12px] text-[var(--color-neutro-500)]">
            {hasDenominaciones ? "Registre las cartas porte y distribuya las denominaciones en cada envase" : "Registre las cartas porte recibidas y sus envases"}
          </p>
        </div>
      )}

      {/* Totales por clasificación (full mode) */}
      {hasDenominaciones && groups.length > 0 && activeBatch.map((b) => {
        const cla = clasificaciones?.find((c) => c.id === b.clasificacionId);
        const totals = b.items.filter((i) => i.cantidad > 0).map((i) => {
          const total = totalPerDenom(b.clasificacionId, i.nombre);
          const rem = remaining(b.clasificacionId, i.nombre);
          return { ...i, total, rem };
        });
        const hasAny = totals.some((t) => t.total > 0);
        if (!hasAny) return null;
        return (
          <div key={b.clasificacionId} className="border border-[var(--color-neutro-200)] border-l-2 rounded-lg bg-white overflow-hidden shadow-sm" style={cla ? { borderLeftColor: cla.color } : undefined}>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--color-neutro-50)] to-white border-b border-[var(--color-neutro-200)]">
              <Truck className="w-4 h-4 text-[var(--color-neutro-400)]" />
              <p className="text-[12px] font-bold text-[var(--color-neutro-700)]">{cla?.nombre ?? "Sin clasificación"} — Totales por fajo</p>
            </div>
            <div className="px-4 py-2.5">
              <div className="grid grid-cols-2 gap-2">
                {totals.map((t) => (
                  <div key={t.nombre} className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--color-neutro-50)]">
                    <span className="text-[12px] font-medium text-[var(--color-neutro-600)]">{t.nombre}</span>
                    <span className={`text-[14px] font-bold ${t.rem < 0 ? "text-red-600" : t.total === t.cantidad ? "text-green-700" : "text-[var(--color-neutro-900)]"}`}>
                      {formatNum(t.total)} / {formatNum(t.cantidad)}
                      {t.total > 0 && t.rem >= 0 && t.cantidad - t.total > 0 && (
                        <span className="text-[11px] text-amber-600 font-normal ml-1">(falta {formatNum(t.cantidad - t.total)})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Validation messages */}
      <div className="space-y-1">
        {hasDenominaciones && !allValid && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Hay denominaciones que exceden la cantidad disponible. Verifique la distribución.
          </p>
        )}
        {dupCartaPortes.size > 0 && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Números de carta porte duplicados: {[...dupCartaPortes].join(", ")}.
          </p>
        )}
        {dupEnvases.size > 0 && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Números de envase duplicados: {[...dupEnvases].join(", ")}.
          </p>
        )}
        {dupPrecintos.size > 0 && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Números de precinto duplicados: {[...dupPrecintos].join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}
