import { useRef, useState } from "react";
import { Button } from "@coe/design-system";
import { Download, FileText, FileSpreadsheet, FileImage, Table2, FileCode } from "lucide-react";
import { toast } from "sonner";

const FORMATS = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "csv", label: "CSV", icon: FileSpreadsheet },
  { id: "xlsx", label: "XLSX", icon: Table2 },
  { id: "txt", label: "TXT", icon: FileCode },
  { id: "png", label: "PNG", icon: FileImage },
];

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleExport = (format: string) => {
    setOpen(false);
    toast.info(`Exportación a ${format.toUpperCase()} — próximamente disponible`);
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
        <Download className="w-4 h-4" />
        Exportar
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg py-1 min-w-[150px]">
            {FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors"
                  onClick={() => handleExport(fmt.id)}
                >
                  <Icon className="w-4 h-4 text-[var(--color-neutro-400)]" />
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
