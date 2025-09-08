import { useState, useEffect, useCallback, useRef } from "react";
import type CellCoordinate from "../models/CellCordinate";

interface UseDragSelectionReturn {
  selectedCell: CellCoordinate | undefined;
  expandedSelection: CellCoordinate[];
  isDragging: boolean;
  setSelectedCell: (cell: CellCoordinate | undefined) => void;
  setExpandedSelection: (cells: CellCoordinate[]) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onCellMouseDown: (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onCellMouseEnter: (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
}

export default function useDragSelection(
  initialSelectedCell?: CellCoordinate
): UseDragSelectionReturn {
  const [selectedCell, setSelectedCell] = useState<CellCoordinate | undefined>(
    initialSelectedCell
  );
  const [expandedSelection, setExpandedSelection] = useState<CellCoordinate[]>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<
    CellCoordinate | undefined
  >();

  const mouseDownRef = useRef(false);

  //   useEffect(() => {
  //     if (isDragging) {
  //       // Add a no-select class to the document body
  //       document.body.classList.add("no-select");
  //     } else {
  //       // Remove the class when not dragging
  //       document.body.classList.remove("no-select");
  //     }

  //     return () => {
  //       // Clean up on unmount
  //       document.body.classList.remove("no-select");
  //     };
  //   }, [isDragging]);

  const onCellMouseDown = useCallback(
    (
      e: React.MouseEvent<HTMLTableCellElement>,
      rowIndex: number,
      columnIndex: number
    ) => {
      console.log(e);
      //e.preventDefault();

      mouseDownRef.current = true;

      const startCell = { rowIndex, columnIndex };
      setDragStartCell(startCell);
    },
    []
  );

  const onCellMouseEnter = useCallback(
    (
      e: React.MouseEvent<HTMLTableCellElement>,
      rowIndex: number,
      columnIndex: number
    ) => {
      console.log(e);
      //e.stopPropagation();
      if (!isDragging || !dragStartCell) return;

      const minRow = Math.min(dragStartCell.rowIndex, rowIndex);
      const maxRow = Math.max(dragStartCell.rowIndex, rowIndex);
      const minCol = Math.min(dragStartCell.columnIndex, columnIndex);
      const maxCol = Math.max(dragStartCell.columnIndex, columnIndex);

      const newSelection: CellCoordinate[] = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newSelection.push({ rowIndex: r, columnIndex: c });
        }
      }

      setExpandedSelection(newSelection);
    },
    [isDragging, dragStartCell]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // If mouse is down but we're not dragging yet, start dragging
      if (mouseDownRef.current && !isDragging) {
        setIsDragging(true);
      }
      if (isDragging && dragStartCell !== selectedCell) {
        setSelectedCell(dragStartCell);
      }
    },
    [isDragging]
  );

  const onMouseUp = useCallback(() => {
    mouseDownRef.current = false;

    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  return {
    selectedCell,
    expandedSelection,
    isDragging,
    onMouseMove,
    onCellMouseDown,
    onCellMouseEnter,
    setSelectedCell,
    setExpandedSelection,
  };
}
