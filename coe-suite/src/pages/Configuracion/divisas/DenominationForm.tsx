import { useState, useEffect } from "react";
import { Button, Input, Select, Checkbox } from "@coe/design-system";
import { useDivisasStore, TIPOS_DENOMINACION } from "@stores/divisasStore";
import { Modal } from "@components/ui/Modal";

interface DenominationFormProps {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  divisaId: string;
}

export function DenominationForm({ open, onClose, editId, divisaId }: DenominationFormProps) {
  const store = useDivisasStore();
  const existing = editId ? store.denominaciones.find((d) => d.id === editId) : null;

  const [form, setForm] = useState({
    nombre: "",
    tipo: "Billete" as "Billete" | "Moneda",
    valor: 0,
    alto: 0,
    ancho: 0,
    peso: 0,
    color: "#CCCCCC",
    descripcion: "",
    activo: true,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nombre: existing.nombre,
        tipo: existing.tipo,
        valor: existing.valor,
        alto: existing.alto,
        ancho: existing.ancho,
        peso: existing.peso,
        color: existing.color,
        descripcion: existing.descripcion,
        activo: existing.activo,
      });
    } else {
      setForm({ nombre: "", tipo: "Billete", valor: 0, alto: 0, ancho: 0, peso: 0, color: "#CCCCCC", descripcion: "", activo: true });
    }
  }, [existing]);

  function handleSave() {
    if (!form.nombre || form.valor <= 0) return;
    const data = {
      divisaId,
      nombre: form.nombre,
      tipo: form.tipo,
      valor: form.valor,
      alto: form.alto,
      ancho: form.ancho,
      peso: form.peso,
      color: form.color,
      descripcion: form.descripcion,
      activo: form.activo,
    };
    if (editId) store.updateDenominacion(editId, data);
    else store.addDenominacion(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Denominación" : "Nueva Denominación"}
      size="lg"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!form.nombre || form.valor <= 0}>
            {editId ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: 100 Bolívares" />
          <Select label="Tipo" options={TIPOS_DENOMINACION.map((t) => ({ value: t, label: t }))} value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v as "Billete" | "Moneda" })} />
          <Input label="Valor Facial *" type="number" min={0} step={0.01} value={form.valor} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} />
        </div>

        <div className="border-t border-[var(--color-neutro-200)] pt-4">
          <h4 className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-3">Parámetros Físicos</h4>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Alto (mm)" type="number" min={0} step={0.1} value={form.alto} onChange={(e) => setForm({ ...form, alto: parseFloat(e.target.value) || 0 })} placeholder="Ej: 156" />
            <Input label="Ancho (mm)" type="number" min={0} step={0.1} value={form.ancho} onChange={(e) => setForm({ ...form, ancho: parseFloat(e.target.value) || 0 })} placeholder="Ej: 69" />
            <Input label="Peso (g)" type="number" min={0} step={0.01} value={form.peso} onChange={(e) => setForm({ ...form, peso: parseFloat(e.target.value) || 0 })} placeholder="Ej: 1.2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-neutro-600)] mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-corner-m border border-[var(--color-neutro-200)] cursor-pointer"
              />
              <span className="text-[12px] text-[var(--color-neutro-500)]">{form.color}</span>
            </div>
          </div>
          <Input
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Ej: Billete color rojo"
          />
        </div>
        <Checkbox label="Denominación activa" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}
