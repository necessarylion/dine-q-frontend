import { create } from "zustand";

interface UIState {
  sidebarHidden: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarHidden: false,
  toggleSidebar: () => set((state) => ({ sidebarHidden: !state.sidebarHidden })),
}));
