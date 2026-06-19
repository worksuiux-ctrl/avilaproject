import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ImportedCurrencyRecord {
  code: string;
  importedAt: string;
}

interface CurrencyIntegrationState {
  importedISOs: ImportedCurrencyRecord[];
  markImported: (codes: string[]) => void;
  isImported: (code: string) => boolean;
  removeImported: (code: string) => void;
}

export const useCurrencyIntegrationStore = create<CurrencyIntegrationState>()(
  persist(
    (set, get) => ({
      importedISOs: [],

      markImported: (codes: string[]) => {
        const existing = get().importedISOs;
        const existingSet = new Set(existing.map((r) => r.code));
        const now = new Date().toISOString();
        const newRecords = codes
          .filter((c) => !existingSet.has(c))
          .map((code) => ({ code, importedAt: now }));
        set({ importedISOs: [...existing, ...newRecords] });
      },

      isImported: (code: string) => {
        return get().importedISOs.some((r) => r.code === code);
      },

      removeImported: (code: string) => {
        set((s) => ({
          importedISOs: s.importedISOs.filter((r) => r.code !== code),
        }));
      },
    }),
    { name: "coe-currency-integration" }
  )
);
