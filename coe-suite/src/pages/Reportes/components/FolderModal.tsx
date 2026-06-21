import { useState, useMemo } from "react";
import { Dialog, Button } from "@coe/design-system";
import { Folder, FileText, LayoutDashboard, ChevronRight, FileSpreadsheet } from "lucide-react";
import { useReportesStore } from "../stores/reportesStore";
import { REPORTS_MOCK } from "../data/reportesMocks";
import type { Carpeta, SavedReporte, Reporte } from "../data/reportesTypes";

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
}

interface CatalogNodeProps {
  label: string;
  reports: Reporte[];
  depth: number;
}

function CatalogReports({ label, reports, depth }: CatalogNodeProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-[13px] text-[var(--color-neutro-700)] cursor-default"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          className="shrink-0 w-4 h-4 flex items-center justify-center transition-transform cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
        <Folder className="w-4 h-4 shrink-0 text-[var(--color-verde-100)]" />
        <span className="font-medium">{label}</span>
        <span className="text-[11px] text-[var(--color-neutro-400)] ml-auto">{reports.length}</span>
      </div>
      {expanded && (
        <div className="space-y-0.5">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[var(--color-neutro-500)]"
              style={{ paddingLeft: `${24 + depth * 16}px` }}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-[var(--color-ind-azul)]" />
              <span className="truncate">{r.nombre}</span>
              <span className="ml-auto text-[11px] text-[var(--color-neutro-400)]">{r.categoria === "plantilla" ? "Plantilla" : "Regulatorio"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedNode({
  folder,
  folders,
  savedReports,
  depth,
}: {
  folder: Carpeta;
  folders: Carpeta[];
  savedReports: SavedReporte[];
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = folders.filter((f) => f.parentId === folder.id);
  const childReports = savedReports.filter((r) => r.folderId === folder.id);
  const hasContent = children.length > 0 || childReports.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-[13px] text-[var(--color-neutro-700)] cursor-default"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          className="shrink-0 w-4 h-4 flex items-center justify-center transition-transform cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {hasContent ? <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} /> : <span className="w-3" />}
        </button>
        <Folder className="w-4 h-4 shrink-0 text-[var(--color-verde-100)]" />
        <span className="font-medium">{folder.nombre}</span>
        {childReports.length > 0 && (
          <span className="text-[11px] text-[var(--color-neutro-400)] ml-auto">{childReports.length}</span>
        )}
      </div>
      {expanded && (
        <div className="space-y-0.5">
          {childReports.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[var(--color-neutro-500)]"
              style={{ paddingLeft: `${24 + depth * 16}px` }}
            >
              {r.tipo === "dashboard" ? (
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-[var(--color-ind-morado)]" />
              ) : (
                <FileText className="w-3.5 h-3.5 shrink-0 text-[var(--color-verde-100)]" />
              )}
              <span className="truncate">{r.nombre}</span>
              <span className="ml-auto text-[11px] text-[var(--color-neutro-400)]">{new Date(r.createdAt).toLocaleDateString("es-ES")}</span>
            </div>
          ))}
          {children.map((child) => (
            <SavedNode
              key={child.id}
              folder={child}
              folders={folders}
              savedReports={savedReports}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderModal({ open, onClose }: FolderModalProps) {
  const { folders, savedReports } = useReportesStore();

  const plantillas = useMemo(() => REPORTS_MOCK.filter((r) => r.categoria === "plantilla"), []);
  const regulatorios = useMemo(() => REPORTS_MOCK.filter((r) => r.categoria === "regulatorio"), []);

  const subfolders = useMemo(() => folders.filter((f) => f.parentId === "mis-reportes"), [folders]);

  return (
    <Dialog open={open} onClose={onClose} title="Explorar carpetas" size="md">
      <div className="space-y-1 max-h-[420px] overflow-y-auto">
        {/* Catálogo de Reportes */}
        <div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-[13px] text-[var(--color-neutro-700)] cursor-default">
            <Folder className="w-4 h-4 shrink-0 text-[var(--color-verde-100)]" />
            <span className="font-medium">Catálogo de Reportes</span>
            <span className="text-[11px] text-[var(--color-neutro-400)] ml-auto">{REPORTS_MOCK.length}</span>
          </div>
          <div className="space-y-0.5">
            <CatalogReports label="Plantillas" reports={plantillas} depth={2} />
            <CatalogReports label="Regulatorios" reports={regulatorios} depth={2} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-neutro-200)] my-2" />

        {/* Mis Reportes */}
        <div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-[13px] text-[var(--color-neutro-700)] cursor-default">
            <Folder className="w-4 h-4 shrink-0 text-[var(--color-verde-100)]" />
            <span className="font-medium">Mis Reportes</span>
            <span className="text-[11px] text-[var(--color-neutro-400)] ml-auto">
              {savedReports.length > 0 ? `${savedReports.length} elemento${savedReports.length !== 1 ? "s" : ""}` : "Vacío"}
            </span>
          </div>
          <div className="space-y-0.5">
            {savedReports.length === 0 && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[var(--color-neutro-400)] italic"
                style={{ paddingLeft: `${24}px` }}
              >
                Aún no hay reportes guardados
              </div>
            )}
            {savedReports.filter((r) => r.folderId === "mis-reportes").map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[var(--color-neutro-500)]"
                style={{ paddingLeft: `${24}px` }}
              >
                {r.tipo === "dashboard" ? (
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-[var(--color-ind-morado)]" />
                ) : (
                  <FileText className="w-3.5 h-3.5 shrink-0 text-[var(--color-verde-100)]" />
                )}
                <span className="truncate">{r.nombre}</span>
                <span className="ml-auto text-[11px] text-[var(--color-neutro-400)]">{new Date(r.createdAt).toLocaleDateString("es-ES")}</span>
              </div>
            ))}
            {subfolders.map((f) => (
              <SavedNode
                key={f.id}
                folder={f}
                folders={folders}
                savedReports={savedReports}
                depth={2}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--color-neutro-200)]">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Dialog>
  );
}
