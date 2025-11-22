// stores/tableSelectionStore.ts
import { create } from "zustand";
import type ContextMenu from "../components/BaseTable/models/ContextMenu";

interface CommentPopupState {
  contextMenu?: ContextMenu;
  actions: {
    setContextMenu: (contextMenu: ContextMenu | undefined) => void;
  };
}

export const useContextMenuStore = create<CommentPopupState>((set) => ({
  contextMenu: undefined,
  actions: {
    setContextMenu: (contextMenu: ContextMenu | undefined) =>
      set({ contextMenu: contextMenu }),
  },
}));

export const useContextMenu = () =>
  useContextMenuStore((state) => state.contextMenu);

export const useContextMenuActions = () =>
  useContextMenuStore((state) => state.actions);
