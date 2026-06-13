import { useState } from "react";
import { Dialog, Button, Input } from "@coe/design-system";
import { FolderPlus } from "lucide-react";
import { FolderExplorer } from "./FolderExplorer";
import { useReportesStore } from "../stores/reportesStore";
import type { Reporte } from "../data/reportesTypes";

interface SaveReportModalProps {
  open: boolean;
  onClose: () => void;
  report: Reporte | null;
  columnConfig: { key: string; label: string; visible: boolean; order: number }[];
}

export function SaveReportModal({ open, onClose, report, columnConfig }: SaveReportModalProps) {
  const { folders, savedReports, addFolder, saveReport } = useReportesStore();
  const [name, setName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  if (!report) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    saveReport({
      id: `saved-${Date.now()}`,
      nombre: name.trim(),
      reporteBaseId: report.id,
      folderId: selectedFolderId ?? "root",
      columnConfig,
      createdAt: new Date().toISOString(),
    });
    setName("");
    setSelectedFolderId(null);
    onClose();
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder({
      id: `folder-${Date.now()}`,
      nombre: newFolderName.trim(),
      parentId: selectedFolderId,
    });
    setNewFolderName("");
    setCreatingFolder(false);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Guardar Reporte Personalizado" size="md">
      <div className="space-y-4">
        <Input
          label="Nombre del reporte"
          placeholder="Ej: Reporte diario occidente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              Ubicación
            </p>
            <button
              className="flex items-center gap-1 text-[12px] text-[var(--color-verde-100)] font-medium hover:underline"
              onClick={() => setCreatingFolder(!creatingFolder)}
            >
              <FolderPlus className="w-3.5 h-3.5" /> Nueva Carpeta
            </button>
          </div>

          {creatingFolder && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-m">
              <Input
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" size="sm" onClick={handleCreateFolder}>
                Crear
              </Button>
            </div>
          )}

          <div className="max-h-[240px] overflow-y-auto border border-[var(--color-neutro-200)] rounded-corner-m p-2">
            <FolderExplorer
              folders={folders}
              savedReports={savedReports}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onAddFolder={(parentId) => {
                setSelectedFolderId(parentId);
                setCreatingFolder(true);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" disabled={!name.trim()} onClick={handleSave}>
          Guardar
        </Button>
      </div>
    </Dialog>
  );
}
