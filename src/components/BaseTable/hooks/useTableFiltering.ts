import { useState, useMemo } from "react";
import { filterItems } from "../tableFunctions/FilteringAndSorting";
import ActiveTableFilter from "../models/ActiveTableFilter";
import TableItem from "../models/TableItem";
import BaseTableHeader from "../models/BaseTableHeaders";

interface UseTableFilteringReturn {
  activeFilters: ActiveTableFilter[];
  setActiveFilters: (filters: ActiveTableFilter[]) => void;
  clearActiveFilters: () => void;
  setActiveTableFilter: (
    headerId: string,
    itemsToHide: string[] | number[]
  ) => void;
  filteredItems: TableItem[];
  filterItemsCache: Record<string, (string | number)[]>;
}

export default function useTableFiltering(
  items: TableItem[],
  headers: BaseTableHeader[],
  initialFilters: ActiveTableFilter[] = [],
  sortedItems?: TableItem[] // Accept pre-sorted items if available
): UseTableFilteringReturn {
  const [activeFilters, setActiveFilters] =
    useState<ActiveTableFilter[]>(initialFilters);

  const clearActiveFilters = () => {
    setActiveFilters([]);
  };

  const setActiveTableFilter = (
    headerId: string,
    itemsToHide: string[] | number[]
  ) => {
    const filters = [...activeFilters];
    const index = filters.findIndex((filter) => filter.headerId === headerId);

    if (index !== -1) {
      if (itemsToHide.length > 0) {
        // update filter
        filters[index] = { headerId, itemsToHide };
      } else {
        // remove filter
        filters.splice(index, 1);
      }
    } else if (itemsToHide.length > 0) {
      // add filter
      filters.push({ headerId, itemsToHide });
    }

    setActiveFilters(filters);
  };

  // If sortedItems are provided, filter those, otherwise filter the original items
  const itemsToFilter = sortedItems || items;

  const filteredItems = useMemo(() => {
    return filterItems(itemsToFilter, activeFilters);
  }, [itemsToFilter, activeFilters]);

  // Get leaf headers for filtering
  function getLeafHeaders(headers: BaseTableHeader[]): BaseTableHeader[] {
    return headers.flatMap((h) =>
      h.children && h.children.length > 0 ? getLeafHeaders(h.children) : [h]
    );
  }

  const leafHeaders = useMemo(() => getLeafHeaders(headers), [headers]);

  const filterItemsCache = useMemo(() => {
    const cache: Record<string, (string | number)[]> = {};
    leafHeaders.forEach((header) => {
      let headerItems = filteredItems.map((item) => item[header.id]);
      const currentFilter = activeFilters.find(
        (filter) => filter.headerId === header.id
      );
      if (currentFilter) {
        headerItems = headerItems.concat(currentFilter.itemsToHide);
      }
      // Only keep string, number, or undefined
      cache[header.id] = [...new Set(headerItems)].filter(
        (item): item is string | number =>
          typeof item === "string" || typeof item === "number"
      );
    });

    return cache;
  }, [filteredItems, activeFilters, leafHeaders]);

  return {
    activeFilters,
    setActiveFilters,
    clearActiveFilters,
    setActiveTableFilter,
    filteredItems,
    filterItemsCache,
  };
}
