import { useState, useEffect } from "react";
import { Button, Input, Select, Switch, Dialog } from "@coe/design-system";
import { AlertTriangle, AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";
import { useDivisasStore, TIPOS_MONEDA } from "@stores/divisasStore";
import { Modal } from "@components/ui/Modal";
import { CurrencyConfigModal } from "../../../pages/Integraciones/PanelIntegraciones/components/CurrencyConfigModal";
import { isValidCurrencyCode, getKnownDenominations } from "@services/currencyIntegrationService";

function ApiCodeWarning({ code }: { code: string }) {
  const iso = code.toUpperCase();
  const exists = isValidCurrencyCode(iso);
  const denoms = !exists ? null : getKnownDenominations(iso);
  const hasIso = useDivisasStore((s) => s.divisas.some((d) => d.codigoISO === iso));

  if (hasIso) {
    return (
      <p className="flex items-center gap-1 mt-1 text-[11px] text-amber-600">
        <AlertTriangle className="w-3 h-3" /> Ya existe una divisa con este código ISO
      </p>
    );
  }
  if (!exists && code.length >= 3) {
    return (
      <p className="flex items-center gap-1 mt-1 text-[11px] text-amber-600">
        <AlertTriangle className="w-3 h-3" /> No está en la API de divisas
      </p>
    );
  }
  if (denoms) {
    return (
      <p className="mt-1 text-[11px] text-[var(--color-neutro-400)]">
        {denoms.notes.length} billetes · {denoms.coins.length} monedas disponibles en la API
      </p>
    );
  }
  return null;
}

interface CurrencyFormProps {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function CurrencyForm({ open, onClose, editId }: CurrencyFormProps) {
  const store = useDivisasStore();
  const existing = editId ? store.divisas.find((d) => d.id === editId) : null;
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [confirmIso, setConfirmIso] = useState<string | null>(null);

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

  function doSave() {
    const iso = form.codigoISO.toUpperCase();
    const data = {
      nombre: form.nombre,
      codigoISO: iso,
      simbolo: form.simbolo,
      paisOrigen: form.paisOrigen,
      tipoMoneda: form.tipoMoneda,
      tasaCambio: form.tasaCambio,
      factorRedondeo: form.factorRedondeo,
      activo: form.activo,
    };
    if (editId) store.updateDivisa(editId, data);
    else store.addDivisa(data);
    toast.success(editId ? "Divisa actualizada" : "Divisa creada correctamente");
    onClose();
  }

  function handleSave() {
    if (!form.nombre || !form.codigoISO) return;
    const iso = form.codigoISO.toUpperCase();
    const existsInApi = isValidCurrencyCode(iso);
    if (!existsInApi && !editId) {
      setConfirmIso(iso);
      return;
    }
    doSave();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Divisa" : "Nueva Divisa"}
      size="md"
      actions={
        <div className="flex items-center justify-between gap-2">
          {!editId && (
            <Button variant="outline" size="sm" onClick={() => setApiModalOpen(true)}>
              Agregar desde el API
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.codigoISO}>
              {editId ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Bolívar, Dólar" />
          <div>
            <Input label="Código ISO *" maxLength={3} value={form.codigoISO} onChange={(e) => setForm({ ...form, codigoISO: e.target.value })} placeholder="Ej: VES, USD" />
            {form.codigoISO.length >= 2 && !editId && (
              <ApiCodeWarning code={form.codigoISO} />
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Símbolo" maxLength={3} value={form.simbolo} onChange={(e) => setForm({ ...form, simbolo: e.target.value })} placeholder="Ej: Bs, $" />
          <Select label="Tipo de Moneda" options={TIPOS_MONEDA.map((t) => ({ value: t, label: t }))} value={form.tipoMoneda} onChange={(v) => setForm({ ...form, tipoMoneda: v })} />
        </div>
        <Input label="País / Región de Origen" value={form.paisOrigen} onChange={(e) => setForm({ ...form, paisOrigen: e.target.value })} placeholder="Ej: Venezuela, Estados Unidos" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tasa de Cambio" type="number" step={0.0001} min={0} value={form.tasaCambio} onChange={(e) => setForm({ ...form, tasaCambio: parseFloat(e.target.value) || 0 })} />
          <Input label="Factor de Redondeo" type="number" min={0} value={form.factorRedondeo} onChange={(e) => setForm({ ...form, factorRedondeo: parseInt(e.target.value) || 0 })} />
        </div>
        <Switch label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>

      {confirmIso && (
        <Dialog
          open
          onClose={() => setConfirmIso(null)}
          title="Divisa no encontrada en la API"
          size="sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-corner-full bg-amber-100 shrink-0">
              <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[13px] text-[var(--color-neutro-700)] mb-1">
                <strong>{confirmIso}</strong> no existe en la API de divisas.
              </p>
              <p className="text-[12px] text-[var(--color-neutro-500)]">
                Se creará sin denominaciones automáticas. ¿Desea continuar?
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--color-neutro-200)]">
            <Button variant="outline" size="sm" onClick={() => setConfirmIso(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setConfirmIso(null);
                doSave();
              }}
            >
              Aceptar
            </Button>
          </div>
        </Dialog>
      )}

      <CurrencyConfigModal
        open={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onSuccess={() => {
          setApiModalOpen(false);
          onClose();
        }}
      />
    </Modal>
  );
}
