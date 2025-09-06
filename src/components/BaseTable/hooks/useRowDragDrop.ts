import { useState, useCallback, useEffect, useRef } from "react";
import type TableItem from "../models/TableItem";

interface UseRowDragDropProps {
  items: TableItem[];
  onRowsReordered?: (
    fromIndex: number,
    toIndex: number,
    draggedItem: TableItem,
    targetItem: TableItem
  ) => void;
  groupBy?: string;
}

export const useRowDragDrop = ({
  items,
  onRowsReordered,
  groupBy,
}: UseRowDragDropProps) => {
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<TableItem | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isDraggingRow, setIsDraggingRow] = useState(false);

  const handleDragEnd = useCallback(() => {
    setDraggedRowIndex(null);
    setDropTargetIndex(null);
    setIsDraggingRow(false);
    setDraggedItem(null);
  }, []);

  const handleRowDragStart = useCallback(
    (index: number, tableItem: TableItem) => {
      setDraggedRowIndex(index);
      setIsDraggingRow(true);
      setDraggedItem(tableItem);
    },
    []
  );

  const handleDrop = useCallback(
    (targetItem: TableItem) => {
      if (
        draggedRowIndex !== null &&
        dropTargetIndex !== null &&
        draggedRowIndex !== dropTargetIndex
      ) {
        // if groupby is defined, we need to handle reordering within groups
        if (groupBy) {
          if (targetItem[groupBy] !== draggedItem?.[groupBy]) {
            console.warn("Cannot reorder items across different groups");
            return;
          }
        }

        onRowsReordered?.(
          draggedRowIndex,
          dropTargetIndex,
          draggedItem!,
          targetItem
        );
      }

      setDraggedRowIndex(null);
      setDropTargetIndex(null);
      setIsDraggingRow(false);
      setDraggedItem(null);
    },
    [draggedRowIndex, dropTargetIndex, onRowsReordered]
  );

  const handleRowDragOver = useCallback(
    (index: number) => {
      if (draggedRowIndex !== null && draggedRowIndex !== index) {
        setDropTargetIndex(index);
      }
    },
    [draggedRowIndex]
  );

  return {
    draggedRowIndex,
    dropTargetIndex,
    isDraggingRow,
    handleRowDragStart,
    handleDrop,
    handleDragEnd,
    handleRowDragOver,
  };
};
