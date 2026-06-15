import { useState } from "react";
import { ChevronRight, Folder, FolderPlus, FileText } from "lucide-react";
import type { Carpeta, SavedReporte } from "../data/reportesTypes";

interface FolderExplorerProps {
  folders: Carpeta[];
  savedReports: SavedReporte[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (parentId: string | null) => void;
  rootFolderId?: string;
}

function FolderNode({
  folder,
  folders,
  savedReports,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  depth,
}: {
  folder: Carpeta;
  folders: Carpeta[];
  savedReports: SavedReporte[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (parentId: string | null) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = folders.filter((f) => f.parentId === folder.id);
  const childReports = savedReports.filter((r) => r.folderId === folder.id);
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m cursor-pointer text-[13px] transition-colors ${
          isSelected
            ? "bg-[var(--color-verde-100)] text-white"
            : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelectFolder(folder.id)}
      >
        <button
          className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${expanded ? "rotate-90" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {children.length > 0 || childReports.length > 0 ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <span className="w-3" />
          )}
        </button>
        <Folder className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[var(--color-verde-100)]"}`} />
        <span className="truncate">{folder.nombre}</span>
        <button
          className={`ml-auto p-0.5 rounded opacity-0 hover:opacity-100 transition-opacity ${
            isSelected ? "hover:bg-white/20 text-white" : "hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onAddFolder(folder.id);
          }}
          title="Nueva subcarpeta"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && (
        <div className="space-y-0.5">
          {childReports.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[var(--color-neutro-500)]"
              style={{ paddingLeft: `${24 + depth * 16}px` }}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{r.nombre}</span>
            </div>
          ))}
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              folders={folders}
              savedReports={savedReports}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onAddFolder={onAddFolder}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function isDescendantOf(f: Carpeta, targetId: string, all: Carpeta[]): boolean {
  if (f.parentId === targetId) return true;
  if (!f.parentId) return false;
  const parent = all.find((p) => p.id === f.parentId);
  return parent ? isDescendantOf(parent, targetId, all) : false;
}

export function FolderExplorer({
  folders,
  savedReports,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  rootFolderId,
}: FolderExplorerProps) {
  const filtered = rootFolderId
    ? folders.filter((f) => f.id === rootFolderId || isDescendantOf(f, rootFolderId, folders))
    : folders;

  const rootFolders = filtered.filter((f) => f.parentId === null);

  return (
    <div className="space-y-1">
      {!rootFolderId && (
        <div
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m cursor-pointer text-[13px] transition-colors ${
            selectedFolderId === null
              ? "bg-[var(--color-verde-100)] text-white"
              : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <Folder className="w-4 h-4 shrink-0" />
          <span className="font-medium">Raíz</span>
        </div>
      )}
      {rootFolders.map((f) => (
        <FolderNode
          key={f.id}
          folder={f}
          folders={filtered}
          savedReports={savedReports}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onAddFolder={onAddFolder}
          depth={1}
        />
      ))}
    </div>
  );
}
