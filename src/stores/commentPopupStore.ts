import { create } from "zustand";
import type CellCoordinate from "../components/BaseTable/models/CellCordinate";

interface CommentPopupState {
  openCommentCell?: CellCoordinate;
  actions: {
    setOpenCommentCell: (cell: CellCoordinate | undefined) => void;
  };
}

export const useTableDragStore = create<CommentPopupState>((set) => ({
  openCommentCell: undefined,
  actions: {
    setOpenCommentCell: (cell: CellCoordinate | undefined) =>
      set({ openCommentCell: cell }),
  },
}));

export const useOpenCommentCell = () =>
  useTableDragStore((state) => state.openCommentCell);

export const useCommentPopupActions = () =>
  useTableDragStore((state) => state.actions);

