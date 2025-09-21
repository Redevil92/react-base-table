// hooks/useTableInteractions.ts
import { useCallback, useState, useRef, useEffect } from "react";
import type BaseTableHeader from "../models/BaseTableHeaders";
import type TableItem from "../models/TableItem";
import type CellCoordinate from "../models/CellCordinate";
import calculateSelectedCellAndExpandedSelection from "../tableFunctions/CellSelection";

interface UseTableInteractionsProps<T extends TableItem> {
  headers: BaseTableHeader[];
  items: TableItem[];
  groupedItemsEntries?: [string, { rowIndex: number; item: TableItem }[]][];
  onChange?: (
    itemUpdated: T,
    originalIndex: number,
    fromArrayIndex?: number
  ) => void;
  onBulkChange?: (
    items: { itemUpdated: T; originalIndex: number }[],
    headerId: string
  ) => void;
  onRowDoubleClick?: (item: T) => void;
}

export function useTableInteractions<T extends TableItem>({
  headers,
  items,
  groupedItemsEntries,
  onChange,
  onBulkChange,
  onRowDoubleClick,
}: UseTableInteractionsProps<T>) {
  // Cell selection state
  const [selectedCell, setSelectedCell] = useState<CellCoordinate>();
  const [expandedSelection, setExpandedSelection] = useState<CellCoordinate[]>(
    []
  );

  // Get item from cell coordinates
  const getItemFromCellCoordinates = useCallback(
    (cell: CellCoordinate): TableItem | undefined => {
      if (!cell) return undefined;

      if (groupedItemsEntries) {
        const foundItem = groupedItemsEntries.flatMap(([_, items]) =>
          items.filter((item) => item.rowIndex === cell.rowIndex)
        )[0];

        if (foundItem) {
          return foundItem.item;
        }
      } else {
        return items[cell.rowIndex];
      }
      return undefined;
    },
    [groupedItemsEntries, items]
  );

  // Update item and get original index
  const getUpdateItemAndIndex = useCallback(
    (
      editValue: string | number | undefined,
      item: TableItem,
      header: BaseTableHeader,
      fromArrayData?: { index: number }
    ) => {
      const originalIndex = items.findIndex(
        (originalItem) => originalItem === item
      );
      let itemUpdated: T;

      if (fromArrayData) {
        const array = item[header.fromArray!] as any[];
        array[fromArrayData.index] = {
          ...array[fromArrayData.index],
          [header.id]: editValue,
        };
        itemUpdated = { ...item, [header.fromArray!]: array } as T;
      } else {
        itemUpdated = { ...item, [header.id]: editValue } as T;
      }

      return { itemUpdated: itemUpdated, originalIndex };
    },
    [items]
  );

  // Handle cell blur - when focus leaves a cell after editing
  const onCellBlur = useCallback(
    (
      editValue: string | number | undefined,
      item: TableItem,
      header: BaseTableHeader,
      cellCoordinate: CellCoordinate
    ) => {
      const { itemUpdated, originalIndex } = getUpdateItemAndIndex(
        editValue,
        item,
        header,
        cellCoordinate.fromArrayData
      );
      if (onChange) {
        const fromArrayIndex = cellCoordinate.fromArrayData?.index;
        // trigger on change only if value actually changed
        const hasChanged =
          fromArrayIndex === undefined
            ? item[header.id] !== editValue
            : (item[header.fromArray!] as any[])[fromArrayIndex] !== editValue;
        if (hasChanged) {
          onChange(itemUpdated, originalIndex, fromArrayIndex);
        }
      }
    },
    [onChange, getUpdateItemAndIndex]
  );

  const onRightClick = useCallback(
    (
      rowIndex: number,
      columnIndex: number,

      e: React.MouseEvent
    ) => {
      e.preventDefault();
      // if you right click on a cell that is in the expanded selection, we want to keep that selection

      const isInExpandedSelection = expandedSelection.some(
        (cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex
      );

      if (!isInExpandedSelection) {
        // Clear selection and set the right-clicked cell as selected
        setSelectedCell({ rowIndex, columnIndex });
        setExpandedSelection([]);
      }
    },
    [expandedSelection]
  );

  // Handle cell enter - when Enter key is pressed after editing
  const onCellEnter = useCallback(
    (
      editValue: string | number | undefined,
      item: TableItem,
      header: BaseTableHeader,
      cellCoordinate: CellCoordinate
    ) => {
      let expandedSelectionAndSelected = [...expandedSelection];

      // If selectedCell is not included in expandedSelection, add it
      if (
        selectedCell &&
        !expandedSelection.some(
          (cell) =>
            cell.rowIndex === selectedCell.rowIndex &&
            cell.columnIndex === selectedCell.columnIndex
        )
      ) {
        expandedSelectionAndSelected = [...expandedSelection, selectedCell];
      }

      // Handle bulk edit for multiple selected cells
      if (expandedSelection?.length > 1) {
        const itemsToUpdate = expandedSelectionAndSelected
          .map((cell) => {
            const cellItem = getItemFromCellCoordinates(cell);
            if (!cellItem) return null;

            console.log("Edit value", editValue);

            return {
              itemUpdated: { ...cellItem, [header.id]: editValue },
              originalIndex: items.findIndex(
                (originalItem) => originalItem === cellItem
              ),
            };
          })
          .filter(Boolean) as { itemUpdated: T; originalIndex: number }[];

        if (onBulkChange && itemsToUpdate.length > 0) {
          onBulkChange(itemsToUpdate, header.id);
        }
      } else {
        // Handle single cell edit
        const { itemUpdated, originalIndex } = getUpdateItemAndIndex(
          editValue,
          item,
          header
        );
        if (onChange) {
          const fromArrayIndex = cellCoordinate.fromArrayData?.index;
          // trigger on change only if value actually changed
          const hasChanged =
            fromArrayIndex === undefined
              ? item[header.id] !== editValue
              : (item[header.fromArray!] as any[])[fromArrayIndex] !==
                editValue;
          if (hasChanged) {
            onChange(itemUpdated, originalIndex, fromArrayIndex);
          }
        }
      }
    },
    [
      expandedSelection,
      selectedCell,
      getItemFromCellCoordinates,
      items,
      onBulkChange,
      onChange,
      getUpdateItemAndIndex,
    ]
  );

  // Handle cell click
  const onCellClick = useCallback(
    (cellCoordinate: CellCoordinate) => {
      if (
        selectedCell?.rowIndex !== cellCoordinate.rowIndex ||
        selectedCell?.columnIndex !== cellCoordinate.columnIndex ||
        selectedCell?.fromArrayData?.index !==
          cellCoordinate.fromArrayData?.index
      ) {
        setSelectedCell(cellCoordinate);
        setExpandedSelection([]);
      }
    },
    [selectedCell]
  );

  // Handle keyboard navigation
  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { newSelectedCell, newExpandedSelection } =
        calculateSelectedCellAndExpandedSelection(
          e,
          selectedCell,
          expandedSelection,
          headers.length,
          items.length
        );

      setSelectedCell(newSelectedCell);

      setExpandedSelection(newExpandedSelection);
    },
    [selectedCell, expandedSelection, headers.length, items.length]
  );

  // Handle row double click
  const handleRowDoubleClick = useCallback(
    (item: TableItem) => {
      if (onRowDoubleClick) {
        onRowDoubleClick(item as T);
      }
    },
    [onRowDoubleClick]
  );

  // --- Drag Selection Logic ---
  const mouseDownRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<
    CellCoordinate | undefined
  >();

  // Handle cell mouse down
  const onCellMouseDown = useCallback(
    (
      _: React.MouseEvent<HTMLTableCellElement>,
      rowIndex: number,
      columnIndex: number
    ) => {
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
      e.stopPropagation();

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
    [isDragging, dragStartCell, selectedCell]
  );

  const onMouseUp = useCallback(() => {
    mouseDownRef.current = false;

    setIsDragging(false);
  }, []);

  // Add/remove global mouse up listener
  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  return {
    // States
    selectedCell,
    expandedSelection,
    isDragging,

    // State setters
    setSelectedCell,
    setExpandedSelection,

    // Cell interaction handlers
    onCellBlur,
    onCellEnter,
    onCellClick,
    handleCellKeyDown,
    handleRowDoubleClick,

    // Drag selection handlers
    onCellMouseDown,
    onCellMouseEnter,
    onMouseMove,

    // Context menu handler
    onRightClick,

    // Helper functions
    getItemFromCellCoordinates,
  };
}

