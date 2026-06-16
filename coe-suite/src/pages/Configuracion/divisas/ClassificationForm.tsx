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
  const [divisasAplicables, setDivisasAplicables] = useState<string[]>([]);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (existing) {
      setNombre(existing.nombre);
      setDescripcion(existing.descripcion);
      setColor(existing.color);
      setDivisasAplicables(existing.divisasAplicables ?? []);
      setActivo(existing.activo);
    } else {
      setNombre("");
      setDescripcion("");
      setColor("#22c55e");
      setDivisasAplicables([]);
      setActivo(true);
    }
  }, [existing]);

  function toggleDivisa(id: string) {
    setDivisasAplicables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function handleSave() {
    if (!nombre) return;
    const data = { nombre: nombre.trim(), descripcion, color, divisasAplicables, activo };
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
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-neutro-600)] mb-1">Aplica a divisas</label>
          <p className="text-[10px] text-[var(--color-neutro-400)] mb-1.5">Seleccione las divisas a las que aplica esta clasificación (vacío = todas)</p>
          <div className="flex flex-wrap gap-1.5">
            {store.divisas.filter((d) => d.activo).map((d) => {
              const selected = divisasAplicables.length === 0 || divisasAplicables.includes(d.id);
              return (
                <button key={d.id} type="button"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors cursor-pointer ${
                    selected
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-white text-[var(--color-neutro-400)] border-[var(--color-neutro-200)] hover:border-[var(--color-neutro-300)] opacity-50"
                  }`}
                  onClick={() => toggleDivisa(d.id)}
                >
                  {d.simbolo} {d.codigoISO}
                </button>
              );
            })}
          </div>
        </div>
        <Checkbox label="Clasificación activa" checked={activo} onChange={setActivo} />
      </div>
    </Modal>
  );
}
