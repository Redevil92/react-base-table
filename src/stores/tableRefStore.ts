// In tableDataStore.ts
import React, { type RefObject } from "react";
import { create } from "zustand";

interface TableRefState {
  tableRef: RefObject<HTMLTableElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  actions: {
    setTableRef: (ref: RefObject<HTMLTableElement | null>) => void;
    setScrollRef: (ref: RefObject<HTMLDivElement | null>) => void;
  };
}

export const useTableRefStore = create<TableRefState>((set) => ({
  tableRef: React.createRef<HTMLTableElement>(),
  scrollRef: React.createRef<HTMLDivElement>(),
  actions: {
    setTableRef: (ref) => set({ tableRef: ref }),
    setScrollRef: (ref) => set({ scrollRef: ref }),
  },
}));

export const useTableRef = () => useTableRefStore((state) => state.tableRef);
export const useScrollRef = () => useTableRefStore((state) => state.scrollRef);
export const useTableRefActions = () =>
  useTableRefStore((state) => state.actions);
