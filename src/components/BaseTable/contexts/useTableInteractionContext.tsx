// 1. Create the Context
import { createContext, useContext, useMemo, type CSSProperties } from "react";
import { useTableInteractions } from "../hooks/useTableInteractions";
import type CellCoordinate from "../models/CellCordinate";
import type TableItem from "../models/TableItem";
import type BaseTableHeader from "../models/BaseTableHeaders";
import { useRowDragDrop } from "../hooks/useRowDragDrop";

import type CommentData from "../models/CommentData";
import type HighlightCondition from "../models/HighlightCondition";
import {
  useGroupBy,
  useProcessedItems,
  useTableItems,
} from "../../../stores/tableDataStore";

interface TableInteractionContextValue {
  setExpandedSelection: (cells: CellCoordinate[]) => void;
  onCellBlur: (
    editValue: string | number | undefined,
    item: TableItem,
    header: BaseTableHeader,
    cellCoordinate: CellCoordinate
  ) => Promise<void> | void;
  onCellEnter: (
    editValue: string | number | undefined,
    item: TableItem,
    header: BaseTableHeader,
    cellCoordinate: CellCoordinate
  ) => Promise<void> | void;
  onCellClick: (cellCoordinate: CellCoordinate) => Promise<void> | void;
  handleCellKeyDown: (e: React.KeyboardEvent) => Promise<void> | void;
  handleRowDoubleClick: (item: TableItem) => Promise<void> | void;
  onCellMouseDown: (
    _: React.MouseEvent<HTMLTableCellElement>,
    cellCoordinate: CellCoordinate
  ) => Promise<void> | void;
  onCellMouseEnter: (
    e: React.MouseEvent<HTMLTableCellElement>,
    cellCoordinate: CellCoordinate
  ) => Promise<void> | void;
  onMouseMove: (e: React.MouseEvent) => void;
  onRightClick: (cellCoordinate: CellCoordinate, e: React.MouseEvent) => void;
  getItemFromCellCoordinates: (cell: CellCoordinate) => TableItem | undefined;
  draggedRowIndex: number | null;
  dropTargetIndex: number | null;
  isDraggingRow: boolean;
  handleRowDragStart: (index: number, tableItem: TableItem) => void;
  handleDrop: (targetItem: TableItem) => Promise<void> | void;
  handleDragEnd: () => void;
  handleRowDragOver: (index: number) => void;

  onRowDoubleClick?: (item: TableItem) => Promise<void> | void;
  saveCommentHandler: (
    comment: CommentData,
    item: TableItem
  ) => Promise<void> | void;
  deleteCommentHandler: (
    comment: CommentData,
    item: TableItem
  ) => Promise<void> | void;
  setHighlightCondition: (
    item: TableItem,
    headerId: string,
    cssStyle: React.CSSProperties
  ) => Promise<void> | void;
  removeHighlightCondition: (
    item: TableItem,
    headerId: string,
    cssPropertyToRemove: keyof CSSProperties
  ) => Promise<void> | void;
  addListOption: (
    newOption: string,
    header: BaseTableHeader
  ) => Promise<void> | void;
}

const TableInteractionContext = createContext<
  TableInteractionContextValue | undefined
>(undefined);

// 2. Create a Provider component
interface TableInteractionProviderProps<T extends TableItem> {
  children: React.ReactNode;

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
  onRowsReordered?: ((fromIndex: number, toIndex: number) => void) | undefined;
  onSaveComment?: (comment: CommentData, item: TableItem) => void;
  onDeleteComment?: (comment: CommentData, item: TableItem) => void;
  onSetHighlightCondition?: (
    highlightCondition: HighlightCondition,
    item: TableItem
  ) => void;
  onRemoveHighlightCondition?: (
    highlightCondition: HighlightCondition,
    cssPropertyToRemove: keyof CSSProperties,
    item: TableItem
  ) => void;
  onAddListOption?: (newOption: string, header: BaseTableHeader) => void;
}

export const TableInteractionProvider = <T extends TableItem>({
  children,
  groupedItemsEntries,
  onChange,
  onBulkChange,
  onRowDoubleClick,
  onRowsReordered,
  onSaveComment,
  onDeleteComment,
  onSetHighlightCondition,
  onRemoveHighlightCondition,
  onAddListOption,
}: TableInteractionProviderProps<T>) => {
  const processedItems = useProcessedItems();
  const items = useTableItems();
  const groupBy = useGroupBy();

  // Use your existing hook with the props
  const interactions = useTableInteractions({
    items,
    groupedItemsEntries,
    onChange,
    onBulkChange,
    onRowDoubleClick,
    onAddListOption,
    onSaveComment,
    onDeleteComment,
    onSetHighlightCondition,
    onRemoveHighlightCondition,
  });

  const dragDropInteractions = useRowDragDrop({
    items: processedItems,
    onRowsReordered,
    groupBy,
  });

  // Memoize the context value
  const contextValue: TableInteractionContextValue = useMemo(
    () => ({ ...interactions, ...dragDropInteractions }),
    [interactions, dragDropInteractions]
  );

  return (
    <TableInteractionContext.Provider value={contextValue}>
      {children}
    </TableInteractionContext.Provider>
  );
};

// 3. Create the hook for consumers
export function useTableInteractionContext() {
  const context = useContext(TableInteractionContext);
  if (context === undefined) {
    throw new Error(
      "useTableInteractionContext must be used within a TableInteractionProvider"
    );
  }
  return context;
}
