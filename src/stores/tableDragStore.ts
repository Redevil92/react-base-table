// stores/tableSelectionStore.ts
import { create } from "zustand";
import type CellCoordinate from "../components/BaseTable/models/CellCordinate";

interface TableDragState {
  dragStartCell?: CellCoordinate;
  isDragging: boolean;
  actions: {
    setDragStartCell: (cell?: CellCoordinate) => void;
    setIsDragging: (isDragging: boolean) => void;
  };
}

export const useTableDragStore = create<TableDragState>((set) => ({
  dragStartCell: undefined,
  isDragging: false,
  actions: {
    setDragStartCell: (cell) => set({ dragStartCell: cell }),
    setIsDragging: (isDragging) => set({ isDragging }),
  },
}));

export const useDragStartCell = () =>
  useTableDragStore((state) => state.dragStartCell);
export const useIsDragging = () =>
  useTableDragStore((state) => state.isDragging);
export const useDragActions = () => useTableDragStore((state) => state.actions);
