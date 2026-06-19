import { useState, useMemo } from "react";
import { Dialog, Button, SearchBar, Checkbox, Badge, Text } from "@coe/design-system";
import { Download, Info } from "lucide-react";
import { toast } from "sonner";
import { getGroupedCurrencies, isNativeCurrency } from "../../../../services/currencyIntegrationService";
import { useDivisasStore } from "../../../../stores/divisasStore";
import type { Divisa, Denominacion } from "../../../../stores/divisasStore";
import { useCurrencyIntegrationStore } from "../../../../stores/currencyIntegrationStore";
interface CurrencyConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CurrencyConfigModal({ open, onClose, onSuccess }: CurrencyConfigModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const divisasStore = useDivisasStore();
  const integrationStore = useCurrencyIntegrationStore();

  const existingISO = useMemo(() => {
    return new Set(divisasStore.divisas.map((d) => d.codigoISO));
  }, [divisasStore.divisas]);

  const grouped = useMemo(() => {
    const groups = getGroupedCurrencies();
    if (!search.trim()) return groups;

    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        currencies: g.currencies.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.country.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.currencies.length > 0);
  }, [search]);

  const toggleCurrency = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (!isNativeCurrency(code)) next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const g of grouped) {
        for (const c of g.currencies) {
          if (!existingISO.has(c.code) && !isNativeCurrency(c.code)) {
            next.add(c.code);
          }
        }
      }
      return next;
    });
  };

  const deselectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const g of grouped) {
        for (const c of g.currencies) {
          if (!isNativeCurrency(c.code)) next.delete(c.code);
        }
      }
      return next;
    });
  };

  const totalSelected = selected.size;

  if (!open) return null;

  return (
    <Dialog open onClose={onClose} title="Configurar Divisas" size="lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 p-3 rounded-corner-m bg-[var(--color-blue-50)] border border-[var(--color-blue-200)]">
          <Info className="w-4 h-4 text-[var(--color-ind-azul)] shrink-0" />
          <Text variant="small" className="text-[var(--color-ind-azul)]">
            Seleccione las divisas que desea habilitar en Gestión de Divisas.
            Las denominaciones (billetes y monedas) se importarán automáticamente.
            <strong> BS, USD, EUR y COP</strong> ya están configurados y no requieren selección.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por código, nombre o país..."
            className="flex-1"
          />
          <Badge variant="info" size="sm">{totalSelected} seleccionadas</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={selectAllVisible}>
            Seleccionar todas
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAllVisible}>
            Deseleccionar todas
          </Button>
        </div>

        <div className="max-h-[240px] overflow-y-auto -mx-1 px-1 space-y-4">
          {grouped.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-text-grey">
              <Text variant="body">No se encontraron divisas</Text>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.letter}>
                <div className="sticky top-0 z-10 bg-white pb-1 mb-1 border-b border-[var(--color-neutro-200)]">
                  <Text variant="small" className="font-bold text-text-grey">{group.letter}</Text>
                </div>
                <div className="space-y-0.5">
                  {group.currencies.map((c) => {
                    const alreadyExists = existingISO.has(c.code);
                    const isNative = isNativeCurrency(c.code);
                    const disabled = alreadyExists || isNative;
                    const checked = selected.has(c.code) || alreadyExists || isNative;

                    return (
                      <div
                        key={c.code}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded-corner-m
                          transition-colors
                          ${disabled ? "opacity-50" : "hover:bg-[var(--color-neutro-100)] cursor-pointer"}
                        `}
                        onClick={() => !disabled && toggleCurrency(c.code)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            label=""
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleCurrency(c.code)}
                          />
                        </div>
                        <span className="text-sm font-mono font-medium text-text-darkgrey w-12">{c.code}</span>
                        <span className="text-sm text-text-darkgrey truncate flex-1">{c.name}</span>
                        <span className="text-xs text-text-grey w-3 text-center">{c.symbol}</span>
                        <span className="text-[11px] text-text-grey truncate max-w-[160px] hidden sm:block">{c.country}</span>
                        {alreadyExists && (
                          <Badge variant="success" size="sm" className="shrink-0">Configurada</Badge>
                        )}
                        {isNative && (
                          <Badge variant="info" size="sm" className="shrink-0">Nativa</Badge>
                        )}
                        <span className="text-[10px] text-text-grey shrink-0 w-16 text-right">
                          {c.denominations.notes.length}·{c.denominations.coins.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-neutro-200)]">
        <Text variant="small" className="text-text-grey">
          Billetes·Monedas por divisa
        </Text>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={totalSelected === 0}
            onClick={() => {
              const imported = integrationStore.importedISOs.map((r) => r.code);
              const toImport = Array.from(selected).filter(
                (code) => !imported.includes(code) && !existingISO.has(code) && !isNativeCurrency(code)
              );

              if (toImport.length === 0) {
                onClose();
                return;
              }

              const groups = getGroupedCurrencies();
              const currencyMap = new Map(
                groups.flatMap((g) => g.currencies.map((c) => [c.code, c]))
              );

              const state = useDivisasStore.getState();
              const now = new Date().toISOString();

              const nextId = (prefix: string, existing: { id: string }[]) => {
                const nums = existing
                  .map((e) => parseInt(e.id.replace(/\D/g, ""), 10))
                  .filter((n) => !isNaN(n));
                const max = nums.length > 0 ? Math.max(...nums) : 0;
                return `${prefix}${max + 1}`;
              };

              let lastDenId = Math.max(
                ...state.denominaciones.map((d) => parseInt(d.id.replace(/\D/g, ""), 10))
              );

              const colors = [
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#D4A574",
                "#C0C0C0", "#B8860B", "#DDA0DD", "#87CEEB", "#FFD700",
                "#FFA500", "#98FB98", "#FF69B4", "#9370DB", "#FF8C00",
              ];

              const newDivisas: Divisa[] = [];
              const newDenominaciones: Denominacion[] = [];

              for (const code of toImport) {
                const data = currencyMap.get(code);
                if (!data) continue;

                const divisaId = nextId("div-", [...state.divisas, ...newDivisas]);

                newDivisas.push({
                  id: divisaId,
                  nombre: data.name,
                  codigoISO: code,
                  simbolo: data.symbol || code.slice(0, 2),
                  paisOrigen: data.country,
                  tipoMoneda: "Divisa",
                  tasaCambio: 0,
                  factorRedondeo: 2,
                  activo: true,
                  createdAt: now,
                  updatedAt: now,
                });

                for (const note of data.denominations.notes) {
                  lastDenId++;
                  const denId = `den-${lastDenId}`;
                  const colorIdx = lastDenId % colors.length;
                  newDenominaciones.push({
                    id: denId,
                    divisaId,
                    nombre: `${data.symbol || code} ${note}`,
                    tipo: "Billete",
                    valor: note,
                    alto: 156,
                    ancho: 66,
                    peso: 1.0,
                    color: colors[colorIdx],
                    descripcion: `Billete de ${note} ${data.name}`,
                    activo: true,
                    createdAt: now,
                    updatedAt: now,
                  });
                }

                for (const coin of data.denominations.coins) {
                  lastDenId++;
                  const denId = `den-${lastDenId}`;
                  const colorIdx = lastDenId % colors.length;
                  newDenominaciones.push({
                    id: denId,
                    divisaId,
                    nombre: `${data.symbol || code} ${coin}`,
                    tipo: "Moneda",
                    valor: coin,
                    alto: 22,
                    ancho: 22,
                    peso: 5.0,
                    color: colors[colorIdx],
                    descripcion: `Moneda de ${coin} ${data.name}`,
                    activo: true,
                    createdAt: now,
                    updatedAt: now,
                  });
                }
              }

              useDivisasStore.setState({
                divisas: [...state.divisas, ...newDivisas],
                denominaciones: [...state.denominaciones, ...newDenominaciones],
              });

              integrationStore.markImported(toImport);
              if (toImport.length > 0) toast.success(`${toImport.length} divisa(s) importada(s) correctamente`);
              if (onSuccess) onSuccess();
              else onClose();
            }}
          >
            <Download className="w-3.5 h-3.5" /> Importar ({totalSelected})
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
