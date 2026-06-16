import { useState, useEffect, useMemo } from "react";
import { Button, Input, Select, Checkbox } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import { Modal } from "@components/ui/Modal";

interface BundleFormProps {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  defaultDivisaId?: string;
}

export function BundleForm({ open, onClose, editId, defaultDivisaId }: BundleFormProps) {
  const store = useDivisasStore();
  const existing = editId ? store.fajos.find((f) => f.id === editId) : null;

  const existingDenominacion = existing
    ? store.denominaciones.find((d) => d.id === existing.denominacionId)
    : null;

  const [divisaId, setDivisaId] = useState("");
  const [denominacionId, setDenominacionId] = useState("");
  const [nombre, setNombre] = useState("");
  const [cantidadUnidades, setCantidadUnidades] = useState(0);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (existing) {
      setDivisaId(existingDenominacion?.divisaId ?? "");
      setDenominacionId(existing.denominacionId);
      setNombre(existing.nombre);
      setCantidadUnidades(existing.cantidadUnidades);
      setActivo(existing.activo);
    } else {
      setDivisaId(defaultDivisaId ?? "");
      setDenominacionId("");
      setNombre("");
      setCantidadUnidades(0);
      setActivo(true);
    }
  }, [existing, existingDenominacion?.divisaId, defaultDivisaId]);

  const denominacionesFiltradas = useMemo(
    () => store.denominaciones.filter((d) => d.divisaId === divisaId),
    [store.denominaciones, divisaId]
  );

  const denominacionSel = useMemo(
    () => store.denominaciones.find((d) => d.id === denominacionId),
    [store.denominaciones, denominacionId]
  );

  const pesoEstimado = useMemo(() => {
    if (!denominacionSel || cantidadUnidades <= 0) return 0;
    return parseFloat((denominacionSel.peso * cantidadUnidades).toFixed(2));
  }, [denominacionSel, cantidadUnidades]);

  function handleSave() {
    if (!nombre || cantidadUnidades <= 0 || !denominacionId) return;
    const data = {
      denominacionId,
      nombre,
      cantidadUnidades,
      pesoEstimado,
      activo,
    };
    if (editId) store.updateFajo(editId, data);
    else store.addFajo(data);
    onClose();
  }

  const invalid = !nombre || cantidadUnidades <= 0 || !denominacionId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Configuración de Fajo / Paquete" : "Nuevo Fajo / Paquete de Monedas"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" disabled={invalid} onClick={handleSave}>
            {editId ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select
          label="Divisa *"
          placeholder="Seleccionar divisa"
          options={store.divisas.filter((d) => d.activo).map((d) => ({ value: d.id, label: `${d.nombre} (${d.codigoISO})` }))}
          value={divisaId}
          onChange={(v) => { setDivisaId(v); setDenominacionId(""); }}
        />
        <Select
          label="Denominación *"
          placeholder={divisaId ? "Seleccionar denominación" : "Primero seleccione una divisa"}
          options={denominacionesFiltradas.map((d) => ({ value: d.id, label: `${d.nombre} — ${d.tipo} — Valor: ${d.valor}` }))}
          value={denominacionId}
          onChange={setDenominacionId}
          disabled={!divisaId}
        />
        <Input label="Nombre del Fajo *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Fajo Completo, Fajo Medio" />
        <Input
          label="Cantidad de unidades *"
          type="number"
          min={1}
          value={cantidadUnidades}
          onChange={(e) => setCantidadUnidades(parseInt(e.target.value) || 0)}
          placeholder="Ej: 100"
        />
        {denominacionSel && (
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 text-[12px] space-y-1">
            <p className="text-[var(--color-neutro-600)]">
              Peso unitario: <strong>{denominacionSel.peso.toFixed(2)} g</strong> por {denominacionSel.tipo.toLowerCase()}
            </p>
            <p className="text-[var(--color-neutro-600)]">
              Peso total estimado: <strong>{pesoEstimado.toFixed(2)} g</strong>
              {cantidadUnidades > 0 && denominacionSel.peso > 0 && (
                <span> ({cantidadUnidades} × {denominacionSel.peso} g)</span>
              )}
            </p>
          </div>
        )}
        <Checkbox label="Fajo activo" checked={activo} onChange={setActivo} />
      </div>
    </Modal>
  );
}
