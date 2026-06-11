import { useState, useEffect } from "react";
import {
  Dialog, Input, Select, Textarea, Button, FileUploader, Text, Chip,
} from "@coe/design-system";
import type { Ticket } from "../data/ticketTypes";
import {
  PRIORIDAD_OPTIONS, CATEGORIA_OPTIONS, DEPARTAMENTO_OPTIONS,
} from "../data/ticketTypes";

interface TicketFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (ticket: Partial<Ticket>) => void;
  onDelete?: (id: string) => void;
  editTicket?: Ticket | null;
}

export function TicketForm({ open, onClose, onSave, onDelete, editTicket }: TicketFormProps) {
  const isEditing = !!editTicket;
  const canModify = !editTicket || editTicket.estado === "nuevo" || editTicket.estado === "abierto";

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [prioridad, setPrioridad] = useState<Ticket["prioridad"]>("media");
  const [files, setFiles] = useState<{ nombre: string; size: string }[]>([]);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo(editTicket?.titulo || "");
      setDescripcion(editTicket?.descripcion || "");
      setCategoria(editTicket?.categoria || "");
      setDepartamento(editTicket?.departamento || "");
      setPrioridad(editTicket?.prioridad || "media");
      setFiles([]);
    }
  }, [open, editTicket]);

  const handleFilesSelected = (fileList: File[]) => {
    const newFiles = fileList.map((f) => ({
      nombre: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const doSave = () => {
    onSave({
      id: editTicket?.id || `TCK-BNC-${String(Date.now()).slice(-4)}`,
      titulo,
      descripcion,
      categoria,
      departamento,
      prioridad: prioridad as Ticket["prioridad"],
      estado: editTicket?.estado || "nuevo",
    });
    handleClose();
  };

  const handleClose = () => {
    setTitulo("");
    setDescripcion("");
    setCategoria("");
    setDepartamento("");
    setPrioridad("media");
    setFiles([]);
    setConfirmSave(false);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        title={isEditing ? "Editar Ticket" : "Nuevo Ticket"}
        size="lg"
        actions={
          <div className="flex items-center justify-between w-full">
            <div>
              {isEditing && canModify && (
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => isEditing ? setConfirmSave(true) : doSave()} disabled={!titulo || !categoria}>
                {isEditing ? "Guardar cambios" : "Crear Ticket"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {isEditing && !canModify && (
            <div className="px-3 py-2 rounded-lg text-[12px] bg-[var(--color-ambar-100)]/10 border border-[var(--color-ambar-100)]/30 text-[var(--color-ambar-100)]">
              Este ticket no se puede modificar porque su estado es "{editTicket?.estado}".
            </div>
          )}

          <Input
            label="Título"
            placeholder="Describe breve y claramente el problema"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={isEditing && !canModify}
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Categoría"
              options={CATEGORIA_OPTIONS}
              placeholder="Selecciona"
              value={categoria}
              onChange={setCategoria}
              disabled={isEditing && !canModify}
            />
            <Select
              label="Departamento"
              options={DEPARTAMENTO_OPTIONS}
              placeholder="Selecciona"
              value={departamento}
              onChange={setDepartamento}
              disabled={isEditing && !canModify}
            />
            <Select
              label="Prioridad"
              options={PRIORIDAD_OPTIONS}
              value={prioridad}
              onChange={(v: string) => setPrioridad(v as Ticket["prioridad"])}
              disabled={isEditing && !canModify}
            />
          </div>

          <div>
            <Text variant="small" className="font-semibold mb-1 block text-[var(--color-neutro-700)]">Descripción</Text>
            <Textarea
              placeholder="Describe el problema con detalle, incluyendo pasos para reproducir si aplica..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={5}
              disabled={isEditing && !canModify}
            />
          </div>

          <div>
            <Text variant="small" className="font-semibold mb-1 block text-[var(--color-neutro-700)]">Archivos adjuntos</Text>
            <FileUploader
              accept="image/*,video/*,.pdf,.xlsx,.xls,.txt,.xml"
              multiple
              maxSize={10 * 1024 * 1024}
              onFilesSelected={handleFilesSelected}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {files.map((f, i) => (
                  <Chip key={i} variant="info" size="sm" onRemove={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>
                    {f.nombre} ({f.size})
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {confirmSave && (
        <Dialog
          open={confirmSave}
          onClose={() => setConfirmSave(false)}
          title="Confirmar cambios"
          size="sm"
          actions={
            <div className="flex items-center gap-2 justify-end w-full">
              <Button variant="ghost" size="sm" onClick={() => setConfirmSave(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => { setConfirmSave(false); doSave(); }}>Sí, confirmar</Button>
            </div>
          }
        >
          <Text variant="body">¿Está seguro de que desea guardar los cambios realizados?</Text>
        </Dialog>
      )}

      {confirmDelete && (
        <Dialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title="Confirmar eliminación"
          size="sm"
          actions={
            <div className="flex items-center gap-2 justify-end w-full">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => {
                setConfirmDelete(false);
                if (editTicket && onDelete && canModify) {
                  onDelete(editTicket.id);
                  handleClose();
                }
              }}>Sí, eliminar</Button>
            </div>
          }
        >
          <Text variant="body">¿Está seguro de que desea eliminar este ticket? Esta acción no se puede deshacer.</Text>
        </Dialog>
      )}
    </>
  );
}
