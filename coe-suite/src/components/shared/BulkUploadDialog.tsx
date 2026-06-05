import { useState, useRef } from "react";
import { Button } from "@coe/design-system";
import { Download, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { downloadTemplate, parseUploadedFile, type ExportColumn } from "../../lib/exportUtils";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  columns: ExportColumn[];
  templateFilename: string;
  onUpload: (rows: Record<string, string>[]) => Promise<void>;
}

export function BulkUploadDialog({
  open, onOpenChange, title, columns, templateFilename, onUpload,
}: BulkUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTemplate = () => {
    downloadTemplate(columns, templateFilename);
    toast.success("Plantilla descargada");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const rows = await parseUploadedFile(file, columns);
      if (rows.length === 0) throw new Error("No se encontraron filas de datos.");
      await onUpload(rows);
      setResult({ success: rows.length, errors: [] });
      toast.success("Carga masiva completada", { description: `${rows.length} registros procesados.` });
    } catch (error: any) {
      setResult({ success: 0, errors: [error.message] });
      toast.error("Error en carga masiva", { description: error.message });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { onOpenChange(false); setResult(null); }}
      title={`Carga Masiva - ${title}`}
      size="sm"
    >
      <div className="space-y-4">
        <Button variant="outline" className="w-full gap-2 justify-center" onClick={handleTemplate}>
          <Download className="h-4 w-4" />
          Descargar Plantilla (.xlsx)
        </Button>

        <div className="relative">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFile}
            disabled={loading}
          />
          <Button
            className="w-full gap-2 justify-center"
            disabled={loading}
            onClick={() => fileRef.current?.click()}
          >
            <FileUp className="h-4 w-4" />
            {loading ? "Procesando..." : "Subir Archivo"}
          </Button>
        </div>

        {result && (
          <div className={`rounded-lg border p-3 text-sm ${result.errors.length ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
            {result.errors.length > 0 ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-600">Error en la carga</p>
                  {result.errors.map((e, i) => <p key={i} className="text-gray-600">{e}</p>)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="font-medium text-green-600">{result.success} registros cargados exitosamente</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
