// stores/tableDataStore.ts
import { create } from "zustand";
import type TableItem from "../components/BaseTable/models/TableItem";
import type BaseTableHeader from "../components/BaseTable/models/BaseTableHeaders";
import type ActiveTableFilter from "../components/BaseTable/models/ActiveTableFilter";
import {
  filterItems,
  sortItems,
} from "../components/BaseTable/tableFunctions/FilteringAndSorting";
import type HighlightCondition from "../components/BaseTable/models/HighlightCondition";
import type CommentData from "../components/BaseTable/models/CommentData";
import type AdvancedTableSettings from "../components/BaseTable/models/AdvancedTableSettings";
import type { NumberCondition } from "../components/BaseTable/tableFilter/filterImplementations/NumberFilter/NumberFilter";

interface TableDataState {
  // State

  headers: BaseTableHeader[];
  hiddenHeadersId: string[];
  leafHeaders: BaseTableHeader[];
  processedHeaders: BaseTableHeader[];
  processedLeafHeaders: BaseTableHeader[];

  items: TableItem[];
  processedItems: TableItem[];

  groupBy?: string;
  linkedGroups?: { master: string; linked: string[] }[];
  collapsedGroups: string[];

  activeFilters: ActiveTableFilter[];
  filterItemsCache: Record<string, (string | number)[]>;
  currentSortId?: string;
  ascendingOrder: boolean;

  advancedSetting?: AdvancedTableSettings;

  highlightConditions: HighlightCondition[];
  comments: CommentData[];

  // Actions
  actions: {
    setItems: (items: TableItem[]) => void;
    setHeaders: (headers: BaseTableHeader[]) => void;
    setHiddenHeadersId: (hiddenHeadersId: string[]) => void;
    setActiveFilter: (
      headerId: string,
      itemsToHide: string[] | number[],
      numberConditions?: NumberCondition[]
    ) => void;
    clearActiveFilters: () => void;
    onResetSort: () => void;
    onSortByColumn: (column: BaseTableHeader) => void;
    processItems: () => void;
    processHeaders: () => void;
    processFilterItemsCache: () => void;
    // setCurrentSortId: (id: string | undefined) => void;

    setGroupBy: (groupBy: string | undefined) => void;
    setLinkedGroups: (
      linkedGroups: { master: string; linked: string[] }[] | undefined
    ) => void;
    setCollapsedGroups: (collapsedGroups: string[]) => void;
    collapseGroup: (group: string) => void;
    setComments: (comments: CommentData[]) => void;
    setHighlightConditions: (conditions: HighlightCondition[]) => void;
    setAdvancedSettings: (settings: AdvancedTableSettings | undefined) => void;
  };
}

export const useTableDataStore = create<TableDataState>((set, get) => ({
  // State
  items: [],
  headers: [],
  hiddenHeadersId: [],
  processedHeaders: [],
  leafHeaders: [],
  processedLeafHeaders: [],

  processedItems: [],
  activeFilters: [],
  filterItemsCache: {},
  // currentSortId: undefined,
  ascendingOrder: true,
  comments: [],
  highlightConditions: [],
  advancedSetting: undefined,
  groupBy: undefined,
  linkedGroups: undefined,
  collapsedGroups: [],

  // Actions
  actions: {
    setItems: (items) => {
      set({ items });
    },
    setHeaders: (headers) => {
      const leafHeaders = getLeafHeaders(headers);
      set({ headers, leafHeaders });
    },
    // setCurrentSortId: (id) => {
    //   set({ currentSortId: id });
    // },
    setHiddenHeadersId: (hiddenHeadersId: string[]) => {
      set({ hiddenHeadersId });
      //useProcessHeaders();
    },
    setActiveFilter: (
      headerId: string,
      itemsToHide: string[] | number[],
      numberConditions?: NumberCondition[]
    ) => {
      const { activeFilters } = get();
      const filters = [...activeFilters];
      const index = filters.findIndex((filter) => filter.headerId === headerId);

      if (index !== -1) {
        if (itemsToHide.length > 0) {
          // update filter
          filters[index] = { headerId, itemsToHide, numberConditions };
        } else {
          // remove filter
          filters.splice(index, 1);
        }
      } else if (itemsToHide.length > 0) {
        // add filter
        filters.push({ headerId, itemsToHide, numberConditions });
      }
      set({ activeFilters: filters });
    },
    clearActiveFilters: () => {
      set({ activeFilters: [] });
    },
    onResetSort: () => {
      set({ currentSortId: undefined, ascendingOrder: true });
    },
    onSortByColumn: (header) => {
      const { currentSortId, ascendingOrder } = get();
      if (!header?.sortable) {
        return;
      }

      let isAscendingOrder;
      if (currentSortId === header.id) {
        isAscendingOrder = !ascendingOrder;
      } else {
        isAscendingOrder = true;
      }

      set({ currentSortId: header.id, ascendingOrder: isAscendingOrder });
    },
    processItems: () => {
      const { items, activeFilters, headers, currentSortId, ascendingOrder } =
        get();
      let processed = [...items];

      // Apply filters
      if (activeFilters.length > 0) {
        processed = applyFilters(processed, activeFilters);
      }

      // Apply sorting
      if (currentSortId) {
        processed = applySorting(
          processed,
          headers,
          ascendingOrder,
          currentSortId
        );
      }

      set({ processedItems: processed });
    },
    processHeaders: () => {
      const { headers, hiddenHeadersId } = get();

      // Build a map of child->parent relationships for quick lookups
      const parentMap = new Map<string, string>();

      const buildParentMap = (
        headerList: BaseTableHeader[],
        parentId?: string
      ) => {
        for (const header of headerList) {
          if (parentId) {
            parentMap.set(header.id, parentId);
          }
          if (header.children && header.children.length > 0) {
            buildParentMap(header.children, header.id);
          }
        }
      };

      buildParentMap(headers);

      // Helper to check if a header or any of its ancestors is hidden
      const isHeaderOrAncestorHidden = (headerId: string): boolean => {
        if (hiddenHeadersId.includes(headerId)) return true;

        let currentId = headerId;
        while (parentMap.has(currentId)) {
          currentId = parentMap.get(currentId)!;
          if (hiddenHeadersId.includes(currentId)) return true;
        }

        return false;
      };

      // Filter headers recursively
      const filterHeadersRecursive = (
        headerList: BaseTableHeader[]
      ): BaseTableHeader[] => {
        return headerList
          .filter((header) => !isHeaderOrAncestorHidden(header.id))
          .map((header) => {
            if (header.children && header.children.length > 0) {
              return {
                ...header,
                children: filterHeadersRecursive(header.children),
              };
            }
            return header;
          });
      };

      const processed = filterHeadersRecursive(headers);
      const processedLeaf = getLeafHeaders(processed);

      set({ processedHeaders: processed, processedLeafHeaders: processedLeaf });
    },
    processFilterItemsCache: () => {
      const { processedItems, activeFilters, leafHeaders } = get();

      const cache: Record<string, (string | number)[]> = {};

      leafHeaders.forEach((header) => {
        let headerItems = processedItems.map((item) => item[header.id]);
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

      set({ filterItemsCache: cache });
    },
    setGroupBy: (groupBy) => {
      set({ groupBy });
    },
    setLinkedGroups: (linkedGroups) => {
      set({ linkedGroups });
    },
    collapseGroup: (group) => {
      const { collapsedGroups } = get();
      const isCollapsed = collapsedGroups.includes(group);
      const newCollapsedGroups = isCollapsed
        ? collapsedGroups.filter((g) => g !== group)
        : [...collapsedGroups, group];
      set({ collapsedGroups: newCollapsedGroups });
    },
    setCollapsedGroups: (collapsedGroups) => {
      set({ collapsedGroups });
    },
    setComments: (comments: CommentData[]) => {
      set({ comments });
    },
    setHighlightConditions: (conditions: HighlightCondition[]) => {
      set({ highlightConditions: conditions });
    },
    setAdvancedSettings: (settings: AdvancedTableSettings | undefined) => {
      set({ advancedSetting: settings });
    },
  },
}));

function getLeafHeaders(headers: BaseTableHeader[]): BaseTableHeader[] {
  return headers.flatMap((h) =>
    h.children && h.children.length > 0 ? getLeafHeaders(h.children) : [h]
  );
}

// Helper functions (moved from your hook)
function applyFilters(
  items: TableItem[],
  filters: ActiveTableFilter[]
): TableItem[] {
  // Your filtering logic
  return filterItems(items, filters);
}

function applySorting(
  items: TableItem[],
  headers: BaseTableHeader[],
  ascendingOrder: boolean,
  currentSortId: string | undefined
): TableItem[] {
  // Your sorting logic
  return sortItems(
    items,
    headers,
    ascendingOrder ? "asc" : "desc",
    currentSortId
  );
}

// Selector hooks for convenient access

export const useTableHeaders = () =>
  useTableDataStore((state) => state.headers);
export const useHiddenHeadersId = () =>
  useTableDataStore((state) => state.hiddenHeadersId);
export const useProcessHeaders = () =>
  useTableDataStore((state) => state.processedHeaders);
export const useLeafHeaders = () =>
  useTableDataStore((state) => state.leafHeaders);
export const useProcessedLeafHeaders = () =>
  useTableDataStore((state) => state.processedLeafHeaders);

export const useTableItems = () => useTableDataStore((state) => state.items);
export const useFilterItemsCache = () =>
  useTableDataStore((state) => state.filterItemsCache);
export const useProcessedItems = () =>
  useTableDataStore((state) => state.processedItems);

export const useCurrentSortId = () =>
  useTableDataStore((state) => state.currentSortId);
export const useAscendingOrder = () =>
  useTableDataStore((state) => state.ascendingOrder);
export const useActiveFilters = () =>
  useTableDataStore((state) => state.activeFilters);

export const useSortState = () =>
  useTableDataStore((state) => ({
    currentSortId: state.currentSortId,
    ascendingOrder: state.ascendingOrder,
  }));

export const useAdvancedSettings = () =>
  useTableDataStore((state) => state.advancedSetting);

export const useComments = () => useTableDataStore((state) => state.comments);
export const useHighlightConditions = () =>
  useTableDataStore((state) => state.highlightConditions);

export const useGroupBy = () => useTableDataStore((state) => state.groupBy);
export const useLinkedGroups = () =>
  useTableDataStore((state) => state.linkedGroups);
export const useCollapsedGroups = () =>
  useTableDataStore((state) => state.collapsedGroups);

export const useTableDataActions = () =>
  useTableDataStore((state) => state.actions);

