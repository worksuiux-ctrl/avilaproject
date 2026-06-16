import { Select } from "@coe/design-system";
import { Sigma } from "lucide-react";
import type { ReporteColumn, ColumnAggregation, GroupByConfig, AggregationType } from "../data/reportesTypes";

interface AggregationBarProps {
  columns: ReporteColumn[];
  numericColumns: ReporteColumn[];
  aggregations: ColumnAggregation[];
  groupByConfig: GroupByConfig;
  onAggregationsChange: (aggs: ColumnAggregation[]) => void;
  onGroupByConfigChange: (config: GroupByConfig) => void;
}

export function AggregationBar({
  columns,
  numericColumns,
  aggregations,
  groupByConfig,
  onAggregationsChange,
  onGroupByConfigChange,
}: AggregationBarProps) {
  const aggOptions = [
    { value: "sum", label: "Sumar" },
    { value: "avg", label: "Promediar" },
    { value: "count", label: "Contar" },
    { value: "max", label: "Máximo" },
    { value: "min", label: "Mínimo" },
    { value: "countUnique", label: "Contar Únicos" },
  ];

  const columnOptions = columns
    .filter((c) => c.visible && c.dataType === "number")
    .map((c) => ({ value: c.key, label: c.label }));

  const groupByOptions = columns
    .filter((c) => c.visible)
    .map((c) => ({ value: c.key, label: c.label }));

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[var(--color-neutro-500)] shrink-0">Agrupar por:</span>
          <Select
            options={groupByOptions}
            placeholder="Sin agrupar"
            value={groupByConfig.enabled ? groupByConfig.columnKey : ""}
            onChange={(v) =>
              onGroupByConfigChange({
                columnKey: v,
                enabled: !!v,
              })
            }
            className="min-w-[180px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[var(--color-neutro-500)] shrink-0">Agregación:</span>
          {numericColumns.length === 0 ? (
            <span className="text-[12px] text-[var(--color-neutro-400)] italic">
              No hay columnas numéricas
            </span>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {columnOptions.map((opt) => {
                const agg = aggregations.find((a) => a.columnKey === opt.value);
                return (
                  <div key={opt.value} className="flex items-center gap-1">
                    <span className="text-[12px] text-[var(--color-neutro-700)]">{opt.label}</span>
                    <Select
                      options={aggOptions}
                      placeholder="—"
                      value={agg?.type ?? ""}
                      onChange={(v) => {
                        if (v) {
                          const next = aggregations.filter((a) => a.columnKey !== opt.value);
                          next.push({ columnKey: opt.value, type: v as AggregationType });
                          onAggregationsChange(next);
                        } else {
                          onAggregationsChange(aggregations.filter((a) => a.columnKey !== opt.value));
                        }
                      }}
                      className="min-w-[100px]"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
