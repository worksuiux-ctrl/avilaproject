import { useState, useEffect } from "react";
import { Button, Input, Select, Checkbox } from "@coe/design-system";
import { useDivisasStore, TIPOS_MONEDA } from "@stores/divisasStore";
import { Modal } from "@components/ui/Modal";

interface CurrencyFormProps {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function CurrencyForm({ open, onClose, editId }: CurrencyFormProps) {
  const store = useDivisasStore();
  const existing = editId ? store.divisas.find((d) => d.id === editId) : null;

  const [form, setForm] = useState({
    nombre: "",
    codigoISO: "",
    simbolo: "",
    paisOrigen: "",
    tipoMoneda: "Divisa",
    tasaCambio: 0,
    factorRedondeo: 0,
    activo: true,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nombre: existing.nombre,
        codigoISO: existing.codigoISO,
        simbolo: existing.simbolo,
        paisOrigen: existing.paisOrigen,
        tipoMoneda: existing.tipoMoneda,
        tasaCambio: existing.tasaCambio,
        factorRedondeo: existing.factorRedondeo,
        activo: existing.activo,
      });
    } else {
      setForm({ nombre: "", codigoISO: "", simbolo: "", paisOrigen: "", tipoMoneda: "Divisa", tasaCambio: 0, factorRedondeo: 0, activo: true });
    }
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.codigoISO) return;
    const data = {
      nombre: form.nombre,
      codigoISO: form.codigoISO.toUpperCase(),
      simbolo: form.simbolo,
      paisOrigen: form.paisOrigen,
      tipoMoneda: form.tipoMoneda,
      tasaCambio: form.tasaCambio,
      factorRedondeo: form.factorRedondeo,
      activo: form.activo,
    };
    if (editId) store.updateDivisa(editId, data);
    else store.addDivisa(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Divisa" : "Nueva Divisa"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.codigoISO}>
            {editId ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Bolívar, Dólar" />
          <Input label="Código ISO *" value={form.codigoISO} onChange={(e) => setForm({ ...form, codigoISO: e.target.value })} placeholder="Ej: VES, USD" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Símbolo" value={form.simbolo} onChange={(e) => setForm({ ...form, simbolo: e.target.value })} placeholder="Ej: Bs, $" />
          <Select label="Tipo de Moneda" options={TIPOS_MONEDA.map((t) => ({ value: t, label: t }))} value={form.tipoMoneda} onChange={(v) => setForm({ ...form, tipoMoneda: v })} />
        </div>
        <Input label="País / Región de Origen" value={form.paisOrigen} onChange={(e) => setForm({ ...form, paisOrigen: e.target.value })} placeholder="Ej: Venezuela, Estados Unidos" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tasa de Cambio" type="number" step={0.0001} min={0} value={form.tasaCambio} onChange={(e) => setForm({ ...form, tasaCambio: parseFloat(e.target.value) || 0 })} />
          <Input label="Factor de Redondeo" type="number" min={0} value={form.factorRedondeo} onChange={(e) => setForm({ ...form, factorRedondeo: parseInt(e.target.value) || 0 })} />
        </div>
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}
