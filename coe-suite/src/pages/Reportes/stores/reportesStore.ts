import { create } from "zustand";
import type { Carpeta, SavedReporte, ColumnAggregation, GroupByConfig } from "../data/reportesTypes";

interface ReportesState {
  savedReports: SavedReporte[];
  folders: Carpeta[];
  columnAggregations: ColumnAggregation[];
  groupByConfig: GroupByConfig;
  setColumnAggregations: (aggs: ColumnAggregation[]) => void;
  setGroupByConfig: (config: GroupByConfig) => void;
  saveReport: (report: SavedReporte) => void;
  deleteReport: (id: string) => void;
  addFolder: (folder: Carpeta) => void;
  deleteFolder: (id: string) => void;
  getFolderChildren: (parentId: string | null) => Carpeta[];
  initFolders: (folders: Carpeta[]) => void;
}

export const useReportesStore = create<ReportesState>((set, get) => ({
  savedReports: [],
  folders: [],
  columnAggregations: [],
  groupByConfig: { columnKey: "", enabled: false },
  setColumnAggregations: (aggs) => set({ columnAggregations: aggs }),
  setGroupByConfig: (config) => set({ groupByConfig: config }),
  saveReport: (report) => set((s) => ({ savedReports: [...s.savedReports, report] })),
  deleteReport: (id) => set((s) => ({ savedReports: s.savedReports.filter((r) => r.id !== id) })),
  addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
  deleteFolder: (id) =>
    set((s) => ({ folders: s.folders.filter((f) => f.id !== id && f.parentId !== id) })),
  getFolderChildren: (parentId) => get().folders.filter((f) => f.parentId === parentId),
  initFolders: (folders) => set({ folders }),
}));
