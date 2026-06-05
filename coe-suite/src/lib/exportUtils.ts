import * as XLSX from "xlsx";

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
}

export async function exportToExcel(data: any[], columns: ExportColumn[], filename: string) {
  const header = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((col) => (col.format ? col.format(row[col.key], row) : (row[col.key] ?? "")))
  );
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = columns.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV(data: any[], columns: ExportColumn[], filename: string) {
  const header = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((col) => (col.format ? col.format(row[col.key], row) : (row[col.key] ?? "")))
  );
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTemplate(columns: ExportColumn[], filename: string) {
  const header = columns.map((c) => c.label);
  const ws = XLSX.utils.aoa_to_sheet([header]);
  ws["!cols"] = columns.map((c) => ({ wch: Math.max(c.label.length + 4, 15) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
  XLSX.writeFile(wb, `plantilla_${filename}.xlsx`);
}

export async function parseUploadedFile(file: File, expectedColumns: ExportColumn[]): Promise<Record<string, string>[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  if (raw.length < 2) throw new Error("El archivo está vacío o no tiene datos.");

  const headers = (raw[0] as string[]).map((h) => String(h).trim());
  const expectedLabels = expectedColumns.map((c) => c.label);

  const missing = expectedLabels.filter((l) => !headers.includes(l));
  if (missing.length > 0) {
    throw new Error(`Columnas faltantes: ${missing.join(", ")}. Descarga la plantilla para verificar el formato.`);
  }

  return raw.slice(1).map((row: any) => {
    const obj: Record<string, string> = {};
    expectedColumns.forEach((col) => {
      const idx = headers.indexOf(col.label);
      obj[col.key] = idx >= 0 ? String(row[idx] ?? "").trim() : "";
    });
    return obj;
  });
}
