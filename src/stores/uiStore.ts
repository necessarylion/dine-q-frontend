import { create } from "zustand";

interface UIState {
  sidebarHidden: boolean;
  toggleSidebar: () => void;
  setSidebarHidden: (hidden: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarHidden: false,
  setSidebarHidden: (hidden: boolean) => set({ sidebarHidden: hidden }),
  toggleSidebar: () => {
    const next = !get().sidebarHidden;
    set({ sidebarHidden: next });
    if (next) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  },
}));
