// hooks/useTableInteractions.ts
import { useCallback, useRef, useEffect, type CSSProperties } from "react";
import type BaseTableHeader from "../models/BaseTableHeaders";
import type TableItem from "../models/TableItem";
import type CellCoordinate from "../models/CellCordinate";
import calculateSelectedCellAndExpandedSelection from "../tableFunctions/CellSelection";
import {
  useSelectionActions,
  useTableSelectionStore,
} from "../../../stores/tableSelectionStore";
import { useTableDragStore } from "../../../stores/tableDragStore";
import type HighlightCondition from "../models/HighlightCondition";
import type CommentData from "../models/CommentData";
import {
  useProcessedLeafHeaders,
  useTableHeaders,
} from "../../../stores/tableDataStore";
import { getCellId } from "../../../utils/cellIdCreation";

interface UseTableInteractionsProps<T extends TableItem> {
  items: TableItem[];
  groupedItemsEntries?: [string, { rowIndex: number; item: TableItem }[]][];
  onChange?: (
    itemUpdated: T,
    originalIndex: number,
    fromArrayIndex?: number
  ) => Promise<void> | void;
  onBulkChange?: (
    items: { itemUpdated: T; originalIndex: number }[],
    headerId: string
  ) => Promise<void> | void;
  onRowDoubleClick?: (item: T) => Promise<void> | void;

  onSaveComment?: (
    comment: CommentData,
    item: TableItem
  ) => Promise<void> | void;
  onDeleteComment?: (
    comment: CommentData,
    item: TableItem
  ) => Promise<void> | void;
  onSetHighlightCondition?: (
    highlightCondition: HighlightCondition,
    item: TableItem
  ) => Promise<void> | void;
  onRemoveHighlightCondition?: (
    highlightCondition: HighlightCondition,
    cssPropertyToRemove: keyof CSSProperties,
    item: TableItem
  ) => Promise<void> | void;
  onAddListOption?: (
    newOption: string,
    header: BaseTableHeader
  ) => Promise<void> | void;
}

export function useTableInteractions<T extends TableItem>({
  items,
  groupedItemsEntries,
  onChange,
  onBulkChange,
  onRowDoubleClick,
  onSaveComment,
  onDeleteComment,
  onSetHighlightCondition,
  onRemoveHighlightCondition,
  onAddListOption,
}: UseTableInteractionsProps<T>) {
  //const selectedCell = useTableSelectionStore.getState().selectedCell;
  //const expandedSelection = useExpandedSelection();
  const { setSelectedCell, setExpandedSelection } = useSelectionActions();

  const processedLeafHeaders = useProcessedLeafHeaders();
  const headers = useTableHeaders();

  //const dragStartCell = useDragStartCell();
  const { setDragStartCell, setIsDragging } = useTableDragStore(
    (state) => state.actions
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
    async (
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
          await onChange(itemUpdated, originalIndex, fromArrayIndex);
        }
      }
    },
    [onChange, getUpdateItemAndIndex]
  );

  const onRightClick = useCallback(
    (
      cellCoordinate: CellCoordinate,

      e: React.MouseEvent
    ) => {
      e.preventDefault();
      // if you right click on a cell that is in the expanded selection, we want to keep that selection
      const expandedSelection =
        useTableSelectionStore.getState().expandedSelection;
      const isInExpandedSelection = expandedSelection.some(
        (cell) =>
          cell.rowIndex === cellCoordinate.rowIndex &&
          cell.columnIndex === cellCoordinate.columnIndex &&
          cell.fromArrayData?.index === cellCoordinate.fromArrayData?.index &&
          cell.fromArrayData?.fromArray ===
            cellCoordinate.fromArrayData?.fromArray
      );

      if (!isInExpandedSelection) {
        // Clear selection and set the right-clicked cell as selected
        setSelectedCell(cellCoordinate);
        setExpandedSelection([]);
      }
    },
    []
  );

  // Handle cell enter - when Enter key is pressed after editing
  const onCellEnter = useCallback(
    async (
      editValue: string | number | undefined,
      item: TableItem,
      header: BaseTableHeader,
      cellCoordinate: CellCoordinate
    ) => {
      const selectedCell = useTableSelectionStore.getState().selectedCell;
      const expandedSelection =
        useTableSelectionStore.getState().expandedSelection;

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

            return {
              itemUpdated: { ...cellItem, [header.id]: editValue },
              originalIndex: items.findIndex(
                (originalItem) => originalItem === cellItem
              ),
            };
          })
          .filter(Boolean) as { itemUpdated: T; originalIndex: number }[];

        if (onBulkChange && itemsToUpdate.length > 0) {
          await onBulkChange(itemsToUpdate, header.id);
        }
      } else {
        // Handle single cell edit

        //TODO SB:  probably need to consider fromArrayData here as well
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
              : (item[header.fromArray!] as any[])[fromArrayIndex] !==
                editValue;
          if (hasChanged) {
            await onChange(itemUpdated, originalIndex, fromArrayIndex);
          }
        }
      }
    },
    [
      getItemFromCellCoordinates,
      items,
      onBulkChange,
      onChange,
      getUpdateItemAndIndex,
    ]
  );

  // Handle cell click
  const onCellClick = useCallback((cellCoordinate: CellCoordinate) => {
    // const currentSelectedCell =
    //   useTableSelectionStore.getState().selectedCell;
    const selectedCell = useTableSelectionStore.getState().selectedCell;

    if (
      selectedCell?.rowIndex !== cellCoordinate.rowIndex ||
      selectedCell?.columnIndex !== cellCoordinate.columnIndex ||
      selectedCell?.fromArrayData?.index !== cellCoordinate.fromArrayData?.index
    ) {
      setSelectedCell(cellCoordinate);
      setExpandedSelection([]);
    }
  }, []);

  // Handle keyboard navigation
  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const selectedCell = useTableSelectionStore.getState().selectedCell;
      const expandedSelection =
        useTableSelectionStore.getState().expandedSelection;

      const oldSelectedCell = { ...selectedCell };

      const selectedItem = selectedCell
        ? getItemFromCellCoordinates(selectedCell)
        : undefined;

      const { newSelectedCell, newExpandedSelection } =
        calculateSelectedCellAndExpandedSelection(
          e,
          selectedCell,
          expandedSelection,
          processedLeafHeaders.length,
          items.length,
          processedLeafHeaders,
          selectedItem
        );

      if (
        newSelectedCell?.rowIndex === oldSelectedCell?.rowIndex &&
        newSelectedCell?.columnIndex === oldSelectedCell?.columnIndex &&
        newSelectedCell?.fromArrayData?.index ===
          oldSelectedCell?.fromArrayData?.index
      ) {
        // no change in selection
        return;
      }

      setSelectedCell(newSelectedCell);
      setExpandedSelection(newExpandedSelection);

      // we should be able to focus the new selected cell by id
      focusCell(newSelectedCell);
      // if (newSelectedCell) {
      //   const cellElement = document.getElementById(
      //     getCellId(
      //       newSelectedCell.rowIndex,
      //       newSelectedCell.columnIndex,
      //       newSelectedCell.fromArrayData
      //     )
      //   );

      //   if (cellElement) {
      //     cellElement.focus();
      //   }
      // }
    },
    [headers.length, items.length, items]
  );

  const focusCell = (cellToSelect: CellCoordinate | undefined) => {
    // we should be able to focus the new selected cell by id

    if (cellToSelect) {
      const cellElement = document.getElementById(
        getCellId(
          cellToSelect.rowIndex,
          cellToSelect.columnIndex,
          cellToSelect.fromArrayData
        )
      );
      if (cellElement) {
        cellElement.focus();
      }
    }
  };

  // Handle row double click
  const handleRowDoubleClick = useCallback(
    async (item: TableItem) => {
      if (onRowDoubleClick) {
        await onRowDoubleClick(item as T);
      }
    },
    [onRowDoubleClick]
  );

  // --- Drag Selection Logic ---
  const mouseDownRef = useRef(false);

  // Handle cell mouse down
  const onCellMouseDown = useCallback(
    (
      e: React.MouseEvent<HTMLTableCellElement>,
      cellCoordinate: CellCoordinate
    ) => {
      const selectedCell = useTableSelectionStore.getState().selectedCell;

      const isCtrlOrCmdPressed = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmdPressed) {
        if (!selectedCell) {
          setSelectedCell(cellCoordinate);
        } else {
          focusCell(selectedCell);
        }

        const expandedSelection = [
          ...useTableSelectionStore.getState().expandedSelection,
          cellCoordinate,
        ];

        setExpandedSelection(expandedSelection);
      } else if (
        selectedCell?.rowIndex !== cellCoordinate.rowIndex ||
        selectedCell?.columnIndex !== cellCoordinate.columnIndex ||
        selectedCell?.fromArrayData?.index !==
          cellCoordinate.fromArrayData?.index
      ) {
        setSelectedCell(cellCoordinate);
        setExpandedSelection([]);
      }

      mouseDownRef.current = true;

      setDragStartCell(cellCoordinate);
    },
    []
  );

  const onCellMouseEnter = useCallback(
    (
      e: React.MouseEvent<HTMLTableCellElement>,
      _cellCoordinate: CellCoordinate
    ) => {
      e.stopPropagation();

      const dragStartCell = useTableDragStore.getState().dragStartCell;
      const isDragging = useTableDragStore.getState().isDragging;

      if (!isDragging || !dragStartCell) return;

      const newSelection: CellCoordinate[] = [];

      const startCellElement = document.getElementById(
        getCellId(
          dragStartCell.rowIndex,
          dragStartCell.columnIndex,
          dragStartCell.fromArrayData
        )
      );

      const currentCellElement = e.currentTarget;

      if (!startCellElement || !currentCellElement) return;

      const startRect = startCellElement.getBoundingClientRect();
      const currentRect = currentCellElement.getBoundingClientRect();

      const left = Math.min(startRect.left, currentRect.left);
      const top = Math.min(startRect.top, currentRect.top);
      const right = Math.max(startRect.right, currentRect.right);
      const bottom = Math.max(startRect.bottom, currentRect.bottom);

      const table = currentCellElement.closest("table");
      if (!table) return;

      const allCells = table.getElementsByTagName("td");

      const addedCells = new Set<string>();

      Array.from(allCells).forEach((cell) => {
        const cellRect = cell.getBoundingClientRect();

        const overlapX = Math.max(
          0,
          Math.min(right, cellRect.right) - Math.max(left, cellRect.left)
        );

        const overlapY = Math.max(
          0,
          Math.min(bottom, cellRect.bottom) - Math.max(top, cellRect.top)
        );

        const cellArea = cellRect.width * cellRect.height;
        const overlapArea = overlapX * overlapY;

        // Only include the cell if at least 30% is within the selection rectangle
        const overlapThreshold = 0.3;

        if (overlapArea >= cellArea * overlapThreshold) {
          // Get cell data attributes
          const rowIndex = parseInt(
            cell.getAttribute("data-row-index") || "-1"
          );
          const colIndex = parseInt(
            cell.getAttribute("data-col-index") || "-1"
          );
          const fromArrayName = cell.getAttribute("data-from-array");
          const fromArrayIndex = cell.getAttribute("data-array-index");

          if (rowIndex >= 0 && colIndex >= 0) {
            // Create unique key for this cell
            const cellKey =
              fromArrayName && fromArrayIndex !== null
                ? `${rowIndex}-${colIndex}-${fromArrayName}-${fromArrayIndex}`
                : `${rowIndex}-${colIndex}`;

            // Skip if we already added this cell
            if (addedCells.has(cellKey)) return;
            addedCells.add(cellKey);

            const coordinate: CellCoordinate = {
              rowIndex,
              columnIndex: colIndex,
            };

            // Add fromArrayData if this is an array cell
            if (fromArrayName && fromArrayIndex !== null) {
              coordinate.fromArrayData = {
                fromArray: fromArrayName,
                index: parseInt(fromArrayIndex),
              };
            }

            newSelection.push(coordinate);
          }
        }
      });

      setExpandedSelection(newSelection);
    },
    [items, processedLeafHeaders]
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const selectedCell = useTableSelectionStore.getState().selectedCell;
    const dragStartCell = useTableDragStore.getState().dragStartCell;
    const isDragging = useTableDragStore.getState().isDragging;
    // If mouse is down but we're not dragging yet, start dragging

    if (mouseDownRef.current && !isDragging) {
      setIsDragging(true);
    }

    if (isDragging && dragStartCell !== selectedCell) {
      setSelectedCell(dragStartCell);
      //focusCell(dragStartCell);
    }
  }, []);

  const onMouseUp = useCallback(() => {
    mouseDownRef.current = false;

    setIsDragging(false);
    // TODO: Commented this out for now because it was casuing issues with vertical scrolling, investigate why we need this because it seems to work fine without it
    // Focus selected cell after drag selection
    // const selectedCell = useTableSelectionStore.getState().selectedCell;
    // setTimeout(() => {
    //   focusCell(selectedCell);
    // }, 0);
  }, []);

  const deleteCommentHandler = useCallback(
    async (comment: CommentData, item: TableItem) => {
      if (onDeleteComment) {
        await onDeleteComment(comment, item);
      }
    },
    [onSaveComment, items]
  );

  const saveCommentHandler = useCallback(
    async (comment: CommentData, item: TableItem) => {
      if (onSaveComment) {
        await onSaveComment(comment, item);
      }
    },
    [onSaveComment, items]
  );

  // Add/remove global mouse up listener
  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  const setHighlightCondition = async (
    item: TableItem,
    headerId: string,
    cssStyle: React.CSSProperties
  ) => {
    const highlightCondition: HighlightCondition = {
      propertyId: headerId,
      value: item[headerId],
      columnId: headerId,
      style: cssStyle,
    };

    await onSetHighlightCondition?.(highlightCondition, item);
  };

  // TODO: instead of string we can pass as a type cssPropertyType (investigate)
  const removeHighlightCondition = (
    item: TableItem,
    headerId: string,
    cssPropertyToRemove: keyof CSSProperties
  ) => {
    const highlightCondition: HighlightCondition = {
      propertyId: headerId,
      value: item[headerId],
      columnId: headerId,
      style: {},
    };

    onRemoveHighlightCondition?.(highlightCondition, cssPropertyToRemove, item);
  };

  const addListOption = async (newOption: string, header: BaseTableHeader) => {
    if (onAddListOption) {
      await onAddListOption(newOption, header);
    }
  };

  return {
    // States
    // selectedCell,
    // expandedSelection,
    // isDragging,

    // State setters
    // setSelectedCell,
    setExpandedSelection,

    // Cell interaction handlers
    onCellBlur,
    onCellEnter,
    onCellClick,
    handleCellKeyDown,
    handleRowDoubleClick,

    // Comment handlers
    saveCommentHandler,
    deleteCommentHandler,

    // Highlight condition
    setHighlightCondition,
    removeHighlightCondition,

    // Drag selection handlers
    onCellMouseDown,
    onCellMouseEnter,
    onMouseMove,

    // Context menu handler
    onRightClick,
    addListOption,

    // Helper functions
    getItemFromCellCoordinates,
  };
}
