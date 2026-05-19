// Cross-component UI state (Zustand) — never useState for these.
import { create } from "zustand";

export type Density = "comfortable" | "compact";

interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  density: Density;
  search: string;
  toggleSidebar: () => void;
  setCommandPalette: (open: boolean) => void;
  setDensity: (d: Density) => void;
  setSearch: (s: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  density: "comfortable",
  search: "",
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setDensity: (density) => set({ density }),
  setSearch: (search) => set({ search }),
}));
