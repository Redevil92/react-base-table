import { useState, useMemo, useEffect } from "react";
import { sortItems } from "../tableFunctions/FilteringAndSorting";
import type BaseTableHeader from "../models/BaseTableHeaders";
import type TableItem from "../models/TableItem";

interface UseTableSortingReturn {
  currentSortId: string | undefined;
  setCurrentSortId: (id: string | undefined) => void;
  ascendingOrder: boolean;
  setAscendingOrder: (ascending: boolean) => void;
  onResetSort: () => void;
  onSortByColumn: (header: BaseTableHeader | undefined) => void;
  sortedItems: TableItem[];
}

export default function useTableSorting(
  items: TableItem[],
  headers: BaseTableHeader[],
  initialSortId?: string,
  onSortCallback?: (columnId: string) => void
): UseTableSortingReturn {
  const [currentSortId, setCurrentSortId] = useState<string | undefined>(
    initialSortId
  );
  const [ascendingOrder, setAscendingOrder] = useState(true);

  useEffect(() => {
    setCurrentSortId(initialSortId);
  }, [initialSortId]);

  const onResetSort = () => {
    setCurrentSortId(undefined);
    setAscendingOrder(true);
  };

  const onSortByColumn = (header: BaseTableHeader | undefined) => {
    if (!header?.sortable) {
      return;
    }

    let isAscendingOrder;
    if (currentSortId === header.id) {
      isAscendingOrder = !ascendingOrder;
    } else {
      isAscendingOrder = true;
    }

    setCurrentSortId(header.id);
    setAscendingOrder(isAscendingOrder);

    if (onSortCallback) {
      onSortCallback(header.id);
    }
  };

  const sortedItems = useMemo(() => {
    return sortItems(
      items,
      headers,
      ascendingOrder ? "asc" : "desc",
      currentSortId
    );
  }, [items, headers, ascendingOrder, currentSortId]);

  return {
    currentSortId,
    setCurrentSortId,
    ascendingOrder,
    setAscendingOrder,
    onResetSort,
    onSortByColumn,
    sortedItems,
  };
}
