// stores/tableSelectionStore.ts
import { create } from "zustand";
import type CellCoordinate from "../components/BaseTable/models/CellCordinate";

interface TableSelectionState {
  selectedCell?: CellCoordinate;
  expandedSelection: CellCoordinate[];
  actions: {
    setSelectedCell: (cell?: CellCoordinate) => void;
    setExpandedSelection: (cells: CellCoordinate[]) => void;
    clearSelection: () => void;
  };
}

export const useTableSelectionStore = create<TableSelectionState>((set) => ({
  selectedCell: undefined,
  expandedSelection: [],
  actions: {
    setSelectedCell: (cell) => set({ selectedCell: cell }),
    setExpandedSelection: (cells) => set({ expandedSelection: cells }),
    clearSelection: () =>
      set({ selectedCell: undefined, expandedSelection: [] }),
  },
}));

// Selector hooks for cleaner component code
export const useSelectedCell = () =>
  useTableSelectionStore((state) => state.selectedCell);
export const useExpandedSelection = () =>
  useTableSelectionStore((state) => state.expandedSelection);
export const useSelectionActions = () =>
  useTableSelectionStore((state) => state.actions);

