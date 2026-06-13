import { Select } from "@coe/design-system";
import type { Reporte } from "../data/reportesTypes";

interface ReportSelectorProps {
  reports: Reporte[];
  value: string;
  onChange: (reportId: string) => void;
}

export function ReportSelector({ reports, value, onChange }: ReportSelectorProps) {
  const options = reports.map((r) => ({
    value: r.id,
    label: `${r.nombre}  ·  ${r.categoria === "plantilla" ? "Plantilla" : "Regulatorio"}`,
  }));

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Select
          label="Catálogo de Reportes"
          placeholder="Seleccione un reporte..."
          options={options}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
