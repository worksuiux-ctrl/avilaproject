import { useState, useEffect } from "react";
import { Button, Input, Select, Checkbox } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import { Modal } from "@components/ui/Modal";

const REDES_BLOCKCHAIN = [
  { value: "Ethereum (ERC-20)", label: "Ethereum (ERC-20)" },
  { value: "Binance Smart Chain (BEP-20)", label: "Binance Smart Chain (BEP-20)" },
  { value: "Polygon (ERC-20)", label: "Polygon (ERC-20)" },
  { value: "Solana", label: "Solana" },
  { value: "Tron (TRC-20)", label: "Tron (TRC-20)" },
  { value: "Avalanche (C-Chain)", label: "Avalanche (C-Chain)" },
  { value: "Arbitrum", label: "Arbitrum" },
  { value: "Optimism", label: "Optimism" },
];

const TIPOS_COLLATERAL = [
  { value: "Fiat", label: "Fiat (Reserva en efectivo)" },
  { value: "Crypto", label: "Crypto (Sobrecolateralizado)" },
  { value: "Commodity", label: "Commodity (Respaldado por activos)" },
  { value: "Algoritmico", label: "Algorítmico (Sin respaldo)" },
];

const PEGGED_OPTIONS = [
  { value: "USD", label: "USD — Dólar Americano" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "VES", label: "VES — Bolívar" },
  { value: "COP", label: "COP — Peso Colombiano" },
  { value: "XAU", label: "XAU — Oro" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function StableCoinForm({ open, onClose, editId }: Props) {
  const store = useDivisasStore();
  const existing = editId ? store.stableCoins.find((s) => s.id === editId) : null;

  const [form, setForm] = useState({
    nombre: "",
    codigoISO: "",
    simbolo: "",
    redBlockchain: "Ethereum (ERC-20)",
    contractAddress: "",
    collateralType: "Fiat",
    peggedTo: "USD",
    tasaCambio: 0,
    factorRedondeo: 2,
    activo: true,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nombre: existing.nombre,
        codigoISO: existing.codigoISO,
        simbolo: existing.simbolo,
        redBlockchain: existing.redBlockchain,
        contractAddress: existing.contractAddress,
        collateralType: existing.collateralType,
        peggedTo: existing.peggedTo,
        tasaCambio: existing.tasaCambio,
        factorRedondeo: existing.factorRedondeo,
        activo: existing.activo,
      });
    } else {
      setForm({ nombre: "", codigoISO: "", simbolo: "", redBlockchain: "Ethereum (ERC-20)", contractAddress: "", collateralType: "Fiat", peggedTo: "USD", tasaCambio: 0, factorRedondeo: 2, activo: true });
    }
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.codigoISO) return;
    const data = {
      nombre: form.nombre,
      codigoISO: form.codigoISO.toUpperCase(),
      simbolo: form.simbolo,
      redBlockchain: form.redBlockchain,
      contractAddress: form.contractAddress,
      collateralType: form.collateralType,
      peggedTo: form.peggedTo,
      tasaCambio: form.tasaCambio,
      factorRedondeo: form.factorRedondeo,
      activo: form.activo,
    };
    if (editId) store.updateStableCoin(editId, data);
    else store.addStableCoin(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Stable Coin" : "Nueva Stable Coin"}
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
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: USDT (Tether)" />
          <Input label="Código *" value={form.codigoISO} onChange={(e) => setForm({ ...form, codigoISO: e.target.value })} placeholder="Ej: USDT, USDC" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Símbolo" value={form.simbolo} onChange={(e) => setForm({ ...form, simbolo: e.target.value })} placeholder="Ej: ₮" />
          <Select label="Red Blockchain *" options={REDES_BLOCKCHAIN} value={form.redBlockchain} onChange={(v) => setForm({ ...form, redBlockchain: v })} />
        </div>
        <Input label="Dirección del Contrato" value={form.contractAddress} onChange={(e) => setForm({ ...form, contractAddress: e.target.value })} placeholder="Ej: 0xdAC17F958D2ee523a2206206994597C13D831ec7" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Colateral" options={TIPOS_COLLATERAL} value={form.collateralType} onChange={(v) => setForm({ ...form, collateralType: v })} />
          <Select label="Anclada a" options={PEGGED_OPTIONS} value={form.peggedTo} onChange={(v) => setForm({ ...form, peggedTo: v })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tasa de Cambio" type="number" step={0.0001} min={0} value={form.tasaCambio} onChange={(e) => setForm({ ...form, tasaCambio: parseFloat(e.target.value) || 0 })} />
          <Input label="Factor de Redondeo" type="number" min={0} value={form.factorRedondeo} onChange={(e) => setForm({ ...form, factorRedondeo: parseInt(e.target.value) || 0 })} />
        </div>
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}
