import { useState, useEffect } from "react";
import { Button, Input, Textarea, Checkbox } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import { Modal } from "@components/ui/Modal";

interface ClassificationFormProps {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function ClassificationForm({ open, onClose, editId }: ClassificationFormProps) {
  const store = useDivisasStore();
  const existing = editId ? store.clasificaciones.find((c) => c.id === editId) : null;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (existing) {
      setNombre(existing.nombre);
      setDescripcion(existing.descripcion);
      setColor(existing.color);
      setActivo(existing.activo);
    } else {
      setNombre("");
      setDescripcion("");
      setColor("#22c55e");
      setActivo(true);
    }
  }, [existing]);

  function handleSave() {
    if (!nombre) return;
    const data = { nombre: nombre.trim(), descripcion, color, activo };
    if (editId) store.updateClasificacion(editId, data);
    else store.addClasificacion(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Clasificación" : "Nueva Clasificación"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" disabled={!nombre} onClick={handleSave}>
            {editId ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Apto, No Apto" />
        <Textarea label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción de la clasificación" />
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-neutro-600)] mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-corner-m border border-[var(--color-neutro-200)] cursor-pointer"
            />
            <span className="text-[12px] text-[var(--color-neutro-500)]">{color}</span>
          </div>
        </div>
        <Checkbox label="Clasificación activa" checked={activo} onChange={setActivo} />
      </div>
    </Modal>
  );
}
