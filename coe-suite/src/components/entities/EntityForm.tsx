import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { Button, Select, Input, Checkbox, Textarea } from "@coe/design-system";
import { Modal } from "@components/ui/Modal";
import { ENTITY_TYPES, getEntityType, findTiposPadre } from "@data/entityCatalog";
import { getEntitySchema, type SchemaField } from "@data/entitySchemas";
import { useEntitiesStore, type Entity } from "@stores/entitiesStore";
import { useDispositivosStore } from "@stores/dispositivosStore";

const UNIDADES_TYPES = ENTITY_TYPES.filter(
  (t) => !["Grupos", "Monedas", "Vehículos", "Clientes", "Proveedores"].includes(t.nivel)
);

interface EntityFormProps {
  open: boolean;
  onClose: () => void;
  editEntity?: Entity | null;
  parentId?: string | null;
}

function SchemaFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: unknown;
  onChange: (key: string, val: unknown) => void;
}) {
  switch (field.type) {
    case "select":
      return (
        <Select
          placeholder="Seleccione..."
          options={field.options?.map((o) => ({ value: o, label: o })) ?? []}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(field.key, v)}
        />
      );
    case "multiSelect": {
      const selected = ((value as string[]) ?? []) as string[];
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((o) => {
            const active = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                className={`px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors ${
                  active
                    ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]"
                    : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:bg-[var(--color-neutro-100)]"
                }`}
                onClick={() =>
                  onChange(
                    field.key,
                    active ? selected.filter((x) => x !== o) : [...selected, o]
                  )
                }
              >
                {o}
              </button>
            );
          })}
        </div>
      );
    }
    case "geolocation":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Latitud"
            value={((value as { lat?: string })?.lat) ?? ""}
            onChange={(e) =>
              onChange(field.key, { ...((value as object) ?? {}), lat: e.target.value })
            }
          />
          <Input
            placeholder="Longitud"
            value={((value as { lng?: string })?.lng) ?? ""}
            onChange={(e) =>
              onChange(field.key, { ...((value as object) ?? {}), lng: e.target.value })
            }
          />
        </div>
      );
    case "switch":
      return (
        <Checkbox
          label={field.placeholder ?? "Activar"}
          checked={(value as boolean) ?? false}
          onChange={(v) => onChange(field.key, v)}
        />
      );
    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder}
          value={(value as number | string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value ? Number(e.target.value) : "")}
        />
      );
    case "time":
      return (
        <Input
          type="time"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
    default:
      return (
        <Input
          type="text"
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
  }
}

export function EntityForm({ open, onClose, editEntity, parentId }: EntityFormProps) {
  const { addEntity, updateEntity, entities } = useEntitiesStore();

  const [nivel, setNivel] = useState(editEntity?.nivel ?? UNIDADES_TYPES[0].nivel);
  const [subtipo, setSubtipo] = useState(editEntity?.subtipo ?? "");
  const [codigo, setCodigo] = useState(editEntity?.codigo ?? "");
  const [nombre, setNombre] = useState(editEntity?.nombre ?? "");
  const [padreId, setPadreId] = useState<string | null>(editEntity?.padreId ?? parentId ?? null);
  const [metadata, setMetadata] = useState<Record<string, unknown>>(editEntity?.metadata ?? {});
  const [activeTab, setActiveTab] = useState<"basicos" | "propiedades" | "parametros">("basicos");
  const [error, setError] = useState("");

  const [cantidad, setCantidad] = useState(1);
  const [tipoDispositivoId, setTipoDispositivoId] = useState("");
  const [incluyeContadora, setIncluyeContadora] = useState(false);
  const [tipoContadoraId, setTipoContadoraId] = useState("");
  const [marcaContadoraId, setMarcaContadoraId] = useState("");
  const [modeloContadoraId, setModeloContadoraId] = useState("");
  const [contadorasBoveda, setContadorasBoveda] = useState<Array<{tipoId: string; marcaId: string; modeloId: string}>>([]);

  const tipoActual = getEntityType(nivel);
  const schema = getEntitySchema(nivel);
  const padresPosibles = entities.filter((e) =>
    e.nivel !== "Grupos" && findTiposPadre(nivel).some((t) => t.nivel === e.nivel)
  );

  const { tiposDispositivo, getMarcasByTipoDispositivo, getModelosByMarcaYTipo, getModeloById } = useDispositivosStore();

  const tiposPorSubtipo = useMemo(() => {
    if (nivel !== "Dispositivos") return [];
    if (subtipo === "ATM") return tiposDispositivo.filter(t => t.nombre.startsWith("ATM "));
    if (subtipo === "Caja") return tiposDispositivo.filter(t => t.nombre === "Caja");
    if (subtipo === "Terminal Punto de Venta") return tiposDispositivo.filter(t => t.nombre === "Terminal Punto de Venta");
    if (subtipo === "Máquina Contadora de Billetes") return tiposDispositivo.filter(t => t.nombre === "Máquina Contadora");
    if (subtipo === "Lector de Huellas") return tiposDispositivo.filter(t => t.nombre === "Lector Biométrico");
    return tiposDispositivo.filter(t => t.nombre === subtipo);
  }, [nivel, subtipo, tiposDispositivo]);

  const selectedTipo = tipoDispositivoId ? tiposDispositivo.find(t => t.id === tipoDispositivoId) : undefined;
  const marcasDisponibles = selectedTipo ? getMarcasByTipoDispositivo(selectedTipo.id) : [];
  const marcaSel = metadata.marca ? marcasDisponibles.find((m) => m.nombre === metadata.marca) : undefined;
  const modelosDisponibles = (selectedTipo && marcaSel) ? getModelosByMarcaYTipo(marcaSel.id, selectedTipo.id) : [];

  /* Contadora filtering */
  const contadoraTipo = tipoContadoraId ? tiposDispositivo.find(t => t.id === tipoContadoraId) : undefined;
  const marcasContadora = contadoraTipo ? getMarcasByTipoDispositivo(contadoraTipo.id) : [];
  const marcaContadoraSel = marcaContadoraId ? marcasContadora.find(m => m.id === marcaContadoraId) : undefined;
  const modelosContadora = (contadoraTipo && marcaContadoraSel) ? getModelosByMarcaYTipo(marcaContadoraSel.id, contadoraTipo.id) : [];

  /* Bóveda contadora filtering */
  const bovedaContadoraTipo = tiposDispositivo.find(t => t.nombre === "Máquina Contadora");

  const shouldShowField = useCallback(
    (f: SchemaField) => {
      if (!f.dependsOn) return true;
      if (f.dependsOn.field === "subtipo") return subtipo === f.dependsOn.value;
      return metadata[f.dependsOn.field] === f.dependsOn.value;
    },
    [metadata, subtipo]
  );

  const propiedadesFields = useMemo(
    () =>
      schema?.fields.filter(
        (f) => f.section === "propiedades" && shouldShowField(f)
      ) ?? [],
    [schema, shouldShowField]
  );

  const parametrosFields = useMemo(
    () =>
      schema?.fields.filter(
        (f) => f.section === "parametros" && shouldShowField(f)
      ) ?? [],
    [schema, shouldShowField]
  );

  const tabs = [
    { id: "basicos" as const, label: "Básicos" },
    ...(propiedadesFields.length > 0 ? [{ id: "propiedades" as const, label: "Propiedades" }] : []),
    ...(parametrosFields.length > 0 ? [{ id: "parametros" as const, label: "Parámetros" }] : []),
  ];

  function handleMetadataChange(key: string, val: unknown) {
    setMetadata((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit() {
    if (!codigo.trim() || !nombre.trim()) {
      setError("Código y nombre son requeridos");
      return;
    }
    if (!subtipo && tipoActual?.subtipos.length) {
      setError("Seleccione un subtipo");
      return;
    }
    if (nivel === "Dispositivos" && !tipoDispositivoId) {
      setError("Seleccione un tipo de dispositivo");
      return;
    }
    if (nivel === "Dispositivos" && !metadata.marca) {
      setError("Seleccione una marca");
      return;
    }
    if (nivel === "Dispositivos" && !metadata.modelo) {
      setError("Seleccione un modelo");
      return;
    }
    setError("");

    const enhancedMetadata = {
      ...metadata,
      tipoDispositivoId,
      cantidad: subtipo === "ATM" ? cantidad : 1,
    };

    if (incluyeContadora && modeloContadoraId) {
      enhancedMetadata.incluyeContadora = true;
      enhancedMetadata.tipoContadoraId = tipoContadoraId;
      enhancedMetadata.marcaContadoraId = marcaContadoraId;
      enhancedMetadata.modeloContadoraId = modeloContadoraId;
    }

    if (contadorasBoveda.length > 0) {
      enhancedMetadata.contadorasBoveda = contadorasBoveda;
    }

    const data = { codigo: codigo.trim(), nombre: nombre.trim(), nivel, subtipo, padreId, activo: true, metadata: enhancedMetadata };

    if (editEntity) {
      updateEntity(editEntity.id, data);
    } else {
      addEntity(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editEntity ? "Editar Entidad" : "Nueva Entidad"} size="lg">
      <div className="space-y-5">
        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex gap-0 border-b border-[var(--color-neutro-200)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-[13px] font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-[var(--color-verde-100)] border-[var(--color-verde-100)]"
                    : "text-[var(--color-neutro-400)] border-transparent hover:text-[var(--color-neutro-600)]"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Básicos */}
        {activeTab === "basicos" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Nivel"
                options={UNIDADES_TYPES.map((t) => ({ value: t.nivel, label: t.etiqueta }))}
                value={nivel}
                onChange={(v) => { setNivel(v); setSubtipo(""); setMetadata({}); }}
              />
              {tipoActual && tipoActual.subtipos.length > 0 && (
                <Select
                  label="Subtipo"
                  placeholder="Seleccione..."
                  options={tipoActual.subtipos.map((s) => ({ value: s, label: s }))}
                  value={subtipo}
                  onChange={setSubtipo}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Código" placeholder="Ej: BCO-001" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <Input label="Nombre" placeholder="Nombre de la entidad" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            {nivel === "Dispositivos" && subtipo === "ATM" && !editEntity && (
              <Input label="Cantidad de ATMs a crear" type="number" min={1} max={100}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              />
            )}

            {!editEntity && (
              <Select
                label="Entidad Padre (opcional)"
                placeholder="Sin padre (raíz)"
                options={padresPosibles.map((p) => ({ value: p.id, label: `${p.nombre} (${p.codigo}) — ${p.nivel}` }))}
                value={padreId ?? ""}
                onChange={(v) => setPadreId(v || null)}
              />
            )}

            {tipoActual && (
              <div className="bg-[var(--color-neutro-100)] rounded-corner-m px-3 py-2">
                <p className="text-[12px] text-[var(--color-neutro-500)]">
                  <span className="font-medium">Hijos permitidos:</span>{' '}
                  {tipoActual.hijosPermitidos.length > 0
                    ? tipoActual.hijosPermitidos.join(", ")
                    : "Ninguno (entidad hoja)"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Propiedades */}
        {activeTab === "propiedades" && (
          <div className="space-y-4">
            <p className="text-[12px] text-[var(--color-neutro-400)] mb-2">Datos de identidad y clasificación de la entidad</p>

            {/* ─── Dispositivos: Tipo + Marca + Modelo ─── */}
            {nivel === "Dispositivos" && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">
                    Tipo de Dispositivo <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <Select
                    placeholder="Seleccione tipo..."
                    options={tiposPorSubtipo.map((t) => ({ value: t.id, label: t.nombre }))}
                    value={tipoDispositivoId}
                    onChange={(v) => {
                      setTipoDispositivoId(v);
                      handleMetadataChange("marca", "");
                      handleMetadataChange("modelo", "");
                    }}
                  />
                </div>

                {selectedTipo && (
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">
                      Marca <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <Select
                      placeholder="Seleccione marca..."
                      options={marcasDisponibles.map((m) => ({ value: m.nombre, label: m.nombre }))}
                      value={(metadata.marca as string) ?? ""}
                      onChange={(v) => {
                        handleMetadataChange("marca", v);
                        handleMetadataChange("modelo", "");
                      }}
                    />
                  </div>
                )}

                {marcaSel && (
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">
                      Modelo <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <Select
                      placeholder="Seleccione modelo..."
                      options={modelosDisponibles.map((m) => ({ value: m.nombre, label: m.nombre }))}
                      value={(metadata.modelo as string) ?? ""}
                      onChange={(v) => handleMetadataChange("modelo", v)}
                    />
                  </div>
                )}

                {/* ─── Contadora para Caja ─── */}
                {subtipo === "Caja" && metadata.modelo && (
                  <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox label="Incluir máquina contadora" checked={incluyeContadora} onChange={(v) => setIncluyeContadora(v)} />
                    </div>
                    {incluyeContadora && (
                      <>
                        <div>
                          <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">Tipo de Contadora</label>
                          <Select
                            placeholder="Seleccione tipo..."
                            options={tiposDispositivo.filter(t => t.nombre === "Máquina Contadora").map(t => ({ value: t.id, label: t.nombre }))}
                            value={tipoContadoraId}
                            onChange={(v) => { setTipoContadoraId(v); setMarcaContadoraId(""); setModeloContadoraId(""); }}
                          />
                        </div>
                        {contadoraTipo && (
                          <div>
                            <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">Marca de Contadora</label>
                            <Select
                              placeholder="Seleccione marca..."
                              options={marcasContadora.map((m) => ({ value: m.id, label: m.nombre }))}
                              value={marcaContadoraId}
                              onChange={(v) => { setMarcaContadoraId(v); setModeloContadoraId(""); }}
                            />
                          </div>
                        )}
                        {marcaContadoraSel && (
                          <div>
                            <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">Modelo de Contadora</label>
                            <Select
                              placeholder="Seleccione modelo..."
                              options={modelosContadora.map((m) => ({ value: m.id, label: m.nombre }))}
                              value={modeloContadoraId}
                              onChange={(v) => setModeloContadoraId(v)}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ─── Contadoras para Bóveda ─── */}
            {nivel === "Depósitos" && subtipo === "Bóveda" && !editEntity && (
              <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Máquinas Contadoras</span>
                  <Button size="sm" onClick={() => {
                    if (bovedaContadoraTipo) {
                      setContadorasBoveda(prev => [...prev, { tipoId: bovedaContadoraTipo.id, marcaId: "", modeloId: "" }]);
                    }
                  }} disabled={!bovedaContadoraTipo}>Agregar Contadora</Button>
                </div>
                {contadorasBoveda.length === 0 ? (
                  <p className="text-[13px] text-[var(--color-neutro-400)] italic">Sin contadoras asignadas</p>
                ) : (
                  contadorasBoveda.map((ct, i) => {
                    const tipo = tiposDispositivo.find(t => t.id === ct.tipoId);
                    const marcasBov = tipo ? getMarcasByTipoDispositivo(tipo.id) : [];
                    const marcaBov = ct.marcaId ? marcasBov.find(m => m.id === ct.marcaId) : undefined;
                    const modelosBov = marcaBov ? getModelosByMarcaYTipo(marcaBov.id, ct.tipoId) : [];
                    return (
                      <div key={i} className="flex items-end gap-2 p-3 bg-[var(--color-neutro-50)] rounded-corner-m border border-[var(--color-neutro-200)]">
                        <div className="flex-1">
                          <Select label="Marca" placeholder="Seleccione..."
                            options={marcasBov.map(m => ({ value: m.id, label: m.nombre }))}
                            value={ct.marcaId}
                            onChange={(v) => setContadorasBoveda(prev => prev.map((c, j) => j === i ? { ...c, marcaId: v, modeloId: "" } : c))}
                          />
                        </div>
                        <div className="flex-1">
                          <Select label="Modelo" placeholder={ct.marcaId ? "Seleccione..." : "Primero seleccione marca"}
                            options={modelosBov.map(m => ({ value: m.id, label: m.nombre }))}
                            value={ct.modeloId}
                            onChange={(v) => setContadorasBoveda(prev => prev.map((c, j) => j === i ? { ...c, modeloId: v } : c))}
                          />
                        </div>
                        <button className="p-2 mb-0.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                          onClick={() => setContadorasBoveda(prev => prev.filter((_, j) => j !== i))}
                          title="Quitar contadora"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ─── Schema fields restantes ─── */}
            {propiedadesFields.map((field) => {
              if (nivel === "Dispositivos" && (field.key === "marca" || field.key === "modelo")) return null;
              return (
                <div key={field.key}>
                  <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <SchemaFieldRenderer field={field} value={metadata[field.key]} onChange={handleMetadataChange} />
                </div>
              );
            })}
          </div>
        )}

        {/* Parámetros */}
        {activeTab === "parametros" && (
          <div className="space-y-4">
            <p className="text-[12px] text-[var(--color-neutro-400)] mb-2">Configuración operativa de la entidad</p>
            {parametrosFields.map((field) => (
              <div key={field.key}>
                <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">{field.label}</label>
                <SchemaFieldRenderer field={field} value={metadata[field.key]} onChange={handleMetadataChange} />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit}>{editEntity ? "Guardar cambios" : "Crear entidad"}</Button>
        </div>
      </div>
    </Modal>
  );
}
