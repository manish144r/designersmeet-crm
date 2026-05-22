// Cross-component UI state (Zustand) — never useState for these.
// Existing keys (sidebar/search/density) preserved; nav/modal/filter/
// selection/demo state added for the wired CRM surface.
import { create } from "zustand";

export type Density = "comfortable" | "compact";

export interface ModalState {
  kind: "create" | "edit" | "confirm-delete" | null;
  resource: string | null;
  recordId: string | null;
  defaults?: Record<string, string | number | boolean | null> | null;
}

const SIDEBAR_KEY = "dm.sidebarCollapsed";
function readSidebarPref(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}
function writeSidebarPref(v: boolean): void {
  try {
    window.localStorage.setItem(SIDEBAR_KEY, v ? "1" : "0");
  } catch {
    /* storage unavailable (private mode / SSR) — in-memory only */
  }
}

interface UIState {
  // — existing —
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  density: Density;
  search: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCommandPalette: (open: boolean) => void;
  setDensity: (d: Density) => void;
  setSearch: (s: string) => void;

  // — modals —
  modal: ModalState;
  openCreate: (resource: string) => void;
  openCreateWithDefaults: (
    resource: string,
    defaults: Record<string, string | number | boolean | null>,
  ) => void;
  openEdit: (resource: string, recordId: string) => void;
  openConfirmDelete: (resource: string, recordId: string) => void;
  closeModal: () => void;

  // — per-resource list filters + selection —
  filters: Record<string, Record<string, string>>;
  setFilter: (resource: string, key: string, value: string) => void;
  clearFilters: (resource: string) => void;
  selection: Record<string, string[]>;
  toggleSelected: (resource: string, id: string) => void;
  clearSelection: (resource: string) => void;
}

const NO_MODAL: ModalState = { kind: null, resource: null, recordId: null };

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: readSidebarPref(),
  commandPaletteOpen: false,
  density: "comfortable",
  search: "",
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed;
      writeSidebarPref(next);
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (v) => {
    writeSidebarPref(v);
    set({ sidebarCollapsed: v });
  },
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setDensity: (density) => set({ density }),
  setSearch: (search) => set({ search }),

  modal: NO_MODAL,
  openCreate: (resource) => set({ modal: { kind: "create", resource, recordId: null, defaults: null } }),
  openCreateWithDefaults: (resource, defaults) =>
    set({ modal: { kind: "create", resource, recordId: null, defaults } }),
  openEdit: (resource, recordId) => set({ modal: { kind: "edit", resource, recordId, defaults: null } }),
  openConfirmDelete: (resource, recordId) =>
    set({ modal: { kind: "confirm-delete", resource, recordId, defaults: null } }),
  closeModal: () => set({ modal: NO_MODAL }),

  filters: {},
  setFilter: (resource, key, value) =>
    set((s) => ({
      filters: { ...s.filters, [resource]: { ...(s.filters[resource] ?? {}), [key]: value } },
    })),
  clearFilters: (resource) =>
    set((s) => ({ filters: { ...s.filters, [resource]: {} } })),
  selection: {},
  toggleSelected: (resource, id) =>
    set((s) => {
      const cur = s.selection[resource] ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { selection: { ...s.selection, [resource]: next } };
    }),
  clearSelection: (resource) =>
    set((s) => ({ selection: { ...s.selection, [resource]: [] } })),
}));
