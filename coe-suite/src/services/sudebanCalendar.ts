import { SUDEBAN_2026, type SudebanEntry } from "../pages/Integraciones/PanelIntegraciones/data/sudeban2026";

export interface ImportResult {
  success: number;
  skipped: number;
  total: number;
  errors: string[];
}

export function importSudeban2026(
  configs: { fecha: string; clasificacion: string; alcance: string }[]
): { toAdd: SudebanEntry[]; skipped: string[] } {
  const existingDates = new Set(configs.map((c) => c.fecha));
  const toAdd: SudebanEntry[] = [];
  const skipped: string[] = [];

  for (const entry of SUDEBAN_2026) {
    if (existingDates.has(entry.fecha)) {
      skipped.push(`${entry.fecha} — ${entry.descripcion}`);
    } else {
      toAdd.push(entry);
    }
  }

  return { toAdd, skipped };
}

export function exportSudebanReport(result: ImportResult): string {
  const lines = [
    "=== Importación Calendario SUDEBAN 2026 ===",
    `Fecha: ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`,
    "",
    `Total procesados: ${result.total}`,
    `Importados exitosamente: ${result.success}`,
    `Omitidos (ya existían): ${result.skipped}`,
    `Errores: ${result.errors.length}`,
  ];
  if (result.errors.length > 0) {
    lines.push("", "Detalle de errores:");
    for (const err of result.errors) lines.push(`  - ${err}`);
  }
  return lines.join("\n");
}
