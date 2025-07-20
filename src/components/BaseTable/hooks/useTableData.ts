import { useMemo } from "react";
import useTableFiltering from "./useTableFiltering";
import useTableSorting from "./useTableSorting";
import TableItem from "../models/TableItem";
import BaseTableHeader from "../models/BaseTableHeaders";
import ActiveTableFilter from "../models/ActiveTableFilter";

interface UseTableDataReturn {
  // Filtering
  activeFilters: ActiveTableFilter[];
  setActiveFilters: (filters: ActiveTableFilter[]) => void;
  clearActiveFilters: () => void;
  setActiveTableFilter: (
    headerId: string,
    itemsToHide: string[] | number[]
  ) => void;
  filterItemsCache: Record<string, (string | number)[]>;

  // Sorting
  currentSortId: string | undefined;
  setCurrentSortId: (id: string | undefined) => void;
  ascendingOrder: boolean;
  setAscendingOrder: (ascending: boolean) => void;
  onResetSort: () => void;
  onSortByColumn: (header: BaseTableHeader | undefined) => void;

  // Processed items
  processedItems: TableItem[];
}

export default function useTableData(
  items: TableItem[],
  headers: BaseTableHeader[],
  initialFilters: ActiveTableFilter[] = [],
  initialSortId?: string,
  onSortCallback?: (columnId: string) => void
): UseTableDataReturn {
  // First sort, then filter
  const {
    currentSortId,
    setCurrentSortId,
    ascendingOrder,
    setAscendingOrder,
    onResetSort,
    onSortByColumn,
    sortedItems,
  } = useTableSorting(items, headers, initialSortId, onSortCallback);

  const {
    activeFilters,
    setActiveFilters,
    clearActiveFilters,
    setActiveTableFilter,
    filteredItems,
    filterItemsCache,
  } = useTableFiltering(items, headers, initialFilters, sortedItems);

  // Final processed items after sorting and filtering
  const processedItems = useMemo(() => {
    return filteredItems;
  }, [filteredItems]);

  return {
    // Filtering
    activeFilters,
    setActiveFilters,
    clearActiveFilters,
    setActiveTableFilter,
    filterItemsCache,

    // Sorting
    currentSortId,
    setCurrentSortId,
    ascendingOrder,
    setAscendingOrder,
    onResetSort,
    onSortByColumn,

    // Processed items
    processedItems,
  };
}
