import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type BaseTableHeader from "./models/BaseTableHeaders";
import type TableItem from "./models/TableItem";
import type ActiveTableFilter from "./models/ActiveTableFilter";

import BaseTableHeaders from "./BaseTableHeaders";
import useTableGrouping from "./hooks/useTableGrouping";
import { useVirtualRows } from "./hooks/useVirtualRows";
import type ItemWithGroupInfo from "./models/ItemWithGroupInfo";
import BaseTableGroupRow from "./BaseTableGroupRow";
import type HighlightCondition from "./models/HighlightCondition";
import ContextMenu from "./contextMenu/ContextMenu";
import type CommentData from "./models/CommentData";

import { useSelectionActions } from "../../stores/tableSelectionStore";
import { useIsDragging } from "../../stores/tableDragStore";
import type LinkedGroup from "./models/LinkedGroup";
import {
  useActiveFilters,
  useAdvancedSettings,
  useAscendingOrder,
  useCollapsedGroups,
  useFilterItemsCache,
  useProcessedItems,
  useProcessedLeafHeaders,
  useProcessHeaders,
  useTableDataActions,
} from "../../stores/tableDataStore";
import { useTableInteractionContext } from "./contexts/useTableInteractionContext";
import type AdvancedTableSettings from "./models/AdvancedTableSettings";
import {
  useContextMenu,
  useContextMenuActions,
} from "../../stores/contextMenuStore";
import BaseTableRow from "./BaseTableRow";
import BaseTableFooter from "./BaseTableFooter";
// import BaseTableFooter from "./BaseTableFooter";
import "../../style/tableStyle.css";
import { useTableRefActions } from "../../stores/tableRefStore";
import { TABLE_ID } from "../../constants";
import { useOpenedDialogs } from "../../stores/dialogsStore";
import DialogWrapper from "./dialogs/DialogWrapper";
import "../../index.css";

export interface BaseTableProps<T> {
  height?: string;
  advancedSettings?: AdvancedTableSettings;
  headers: BaseTableHeader[];
  items: TableItem[];
  highlightCondition?: HighlightCondition[];
  comments?: CommentData[];
  activeFilters?: ActiveTableFilter[];
  groupBy?: string;
  linkedGroups?: LinkedGroup[];

  onSetHighlightCondition?: (
    highlightCondition: HighlightCondition,
    item: TableItem
  ) => Promise<void> | void;
  onRemoveHighlightCondition?: (
    highlightCondition: HighlightCondition,
    cssPropertyToRemove: keyof CSSProperties,
    item: TableItem
  ) => Promise<void> | void;
  onSaveComment?: (
    comment: CommentData,
    item: TableItem
  ) => Promise<void> | void;
  onDeleteComment?: (
    comment: CommentData,
    item: TableItem
  ) => Promise<void> | void;
  onChange?: (
    itemUpdated: T,
    originalIndex: number,
    fromArrayIndex?: number
  ) => Promise<void> | void;
  onBulkChange?: (
    items: { itemUpdated: T; originalIndex: number }[],
    headerId: string
  ) => Promise<void> | void;
  groupByCustomRender?: (
    groupBy: string,
    value: string,
    columnsCount: number,
    isCollapsed: boolean,
    onCollapseGroup: (group: string) => void,
    filteredItemsInGroup: ItemWithGroupInfo[],
    masterGroupName?: string,
    linkedGroupNames?: string[]
  ) => ReactNode;
  onResetSort?: () => Promise<void> | void;
  onRowDoubleClick?: (item: T) => Promise<void> | void;
  onSortByColumn?: (columnId: string) => Promise<void> | void;
  onAddListOption?: (
    newOption: string,
    header: BaseTableHeader
  ) => Promise<void> | void;
  onRowsReordered?: (
    fromIndex: number,
    toIndex: number
  ) => Promise<void> | void;
}

export default function BaseTable<T extends TableItem>(
  props: Readonly<BaseTableProps<T>>
) {
  // Zustand stores
  const isDragging = useIsDragging();
  const processedItems = useProcessedItems();
  const activeFilters = useActiveFilters();
  const processedLeafHeaders = useProcessedLeafHeaders();
  const filterItemsCache = useFilterItemsCache();
  const ascendingOrder = useAscendingOrder();
  const collapsedGroups = useCollapsedGroups();
  const advancedSettings = useAdvancedSettings();
  const contextMenu = useContextMenu();

  const {
    clearActiveFilters,
    setActiveFilter,
    onResetSort,
    onSortByColumn,
    collapseGroup,
  } = useTableDataActions();
  const { setSelectedCell, setExpandedSelection } = useSelectionActions();
  const { setContextMenu } = useContextMenuActions();
  const { setTableRef, setScrollRef } = useTableRefActions();

  const openedDialogs = useOpenedDialogs();

  // hooks and contexts
  const { groupedItemsEntries, flatGroupedItems, isGroupLinked } =
    useTableGrouping();

  const flatGroupedItemsWithoutCollapsed = useMemo(() => {
    return flatGroupedItems.filter((item) => {
      if (item.isGroup) {
        return true; // Always include group headers
      }
      // Include item only if its group is not collapsed
      return !collapsedGroups.includes(item.groupName);
    });
  }, [flatGroupedItems, collapsedGroups]);

  const { onMouseMove } = useTableInteractionContext();

  // state, refs and functions
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTableRef(tableRef);
  }, [tableRef]);

  useEffect(() => {
    setScrollRef(scrollRef);
  }, [scrollRef]);

  useEffect(() => {
    if (!advancedSettings?.focusedRowIndex) return;

    // Find the actual virtual index in the flattened list
    let virtualIndex = advancedSettings.focusedRowIndex;

    if (props.groupBy) {
      // Need to find the item in flatGroupedItemsWithoutCollapsed
      let count = 0;
      for (let i = 0; i < flatGroupedItemsWithoutCollapsed.length; i++) {
        const item = flatGroupedItemsWithoutCollapsed[i];
        if (!item.isGroup) {
          if (count === advancedSettings.focusedRowIndex) {
            virtualIndex = i;
            break;
          }
          count++;
        }
      }
    }

    // Wait for next frame to ensure rows are measured
    requestAnimationFrame(() => {
      virtualizer.virtualizer.scrollToIndex(virtualIndex, {
        align: "center",
        behavior: "auto",
      });
    });
  }, [advancedSettings?.focusedRowIndex]);

  const processedHeaders = useProcessHeaders();

  const headersWithIndexColumn = useMemo<BaseTableHeader[]>(() => {
    if (advancedSettings?.showIndex) {
      return [
        {
          id: "_index",
          text: "",
          sortable: false,
          align: "right",
          children: [],
          width: advancedSettings?.enableRowDragDrop ? 55 : 40,
        },
        ...processedHeaders,
      ];
    }
    return processedHeaders;
  }, [
    processedHeaders,
    advancedSettings?.showIndex,
    advancedSettings?.enableRowDragDrop,
  ]);

  const headerStructureSignature = useMemo(() => {
    return {
      ids: props.headers.map((header) => header.id).join(","),
      count: props.headers.length,
    };
  }, [props.headers]);

  useEffect(() => {
    // reset selection
    setContextMenu(undefined);
    clearActiveFilters();
    setSelectedCell(undefined);
    setExpandedSelection([]);
  }, [headerStructureSignature.ids, headerStructureSignature.count]);

  const displayedRowsCount = useMemo(() => {
    if (!props.groupBy) {
      return processedItems.length;
    } else {
      let count = 0;
      groupedItemsEntries.forEach(([groupKey, items]) => {
        count += 1; // group header
        if (!collapsedGroups.includes(groupKey)) {
          count += items.length;
        }
      });
      return count;
    }
  }, [processedItems, groupedItemsEntries, collapsedGroups, props.groupBy]);

  const displayedRowsCountWithoutGroups = useMemo(() => {
    if (!props.groupBy) {
      return processedItems.length;
    } else {
      let count = 0;
      groupedItemsEntries.forEach(([groupKey, items]) => {
        if (!collapsedGroups.includes(groupKey)) {
          count += items.length;
        }
      });
      return count;
    }
  }, [processedItems, groupedItemsEntries, props.groupBy]);

  const virtualizer = useVirtualRows({
    scrollRef: scrollRef,
    rowsCount: displayedRowsCount,
  });

  const filteredItemsByGroup = useMemo(() => {
    const map = new Map<string, ItemWithGroupInfo[]>();

    if (props.groupBy) {
      flatGroupedItems.forEach((item) => {
        if (!item.isGroup) {
          if (!map.has(item.groupName)) {
            map.set(item.groupName, []);
          }
          map.get(item.groupName)!.push(item as ItemWithGroupInfo);
        }
      });
    }

    return map;
  }, [flatGroupedItems, props.groupBy]);

  const virtualRowsRendered = useMemo(() => {
    const virtualRowsData = virtualizer.virtualRows;

    if (props.groupBy) {
      return virtualizer.virtualRows.map((virtualRow) => {
        const itemOrGroup = flatGroupedItemsWithoutCollapsed[virtualRow.index];
        if (itemOrGroup.isGroup) {
          const filteredItemsInGroup =
            filteredItemsByGroup.get(itemOrGroup.groupName) || [];
          return (
            <Fragment key={`group-${itemOrGroup.groupName}`}>
              <BaseTableGroupRow
                dataIndex={virtualRow.index}
                ref={virtualizer.virtualizer.measureElement}
                colSpan={
                  processedLeafHeaders.length +
                  (advancedSettings?.showIndex ? 1 : 0)
                }
                groupBy={props.groupBy!}
                groupName={itemOrGroup.groupName}
                isCollapsed={collapsedGroups.includes(itemOrGroup.groupName)}
                masterGroupName={itemOrGroup.masterGroupName} // Pass master group name if available
                linkedGroupNames={itemOrGroup.linkedGroupNames} // Pass linked group names if available
                onCollapseGroup={collapseGroup}
                groupByCustomRender={
                  props.groupByCustomRender
                    ? (groupBy, value) =>
                        props.groupByCustomRender?.(
                          groupBy,
                          value,
                          processedLeafHeaders.length +
                            (advancedSettings?.showIndex ? 1 : 0),
                          itemOrGroup.isCollapsed || false,
                          collapseGroup,
                          filteredItemsInGroup as ItemWithGroupInfo[],
                          itemOrGroup.masterGroupName,
                          itemOrGroup.linkedGroupNames
                        )
                    : undefined
                }
              />
            </Fragment>
          );
        } else {
          const itemWithGroupInfo = itemOrGroup as ItemWithGroupInfo;

          //if (itemWithGroupInfo.isCollapsed) return;

          return (
            <Fragment
              key={`group-${itemOrGroup.groupName}-item-${itemWithGroupInfo.rowIndex}`}
            >
              <BaseTableRow
                dataIndex={virtualRow.index}
                ref={virtualizer.virtualizer.measureElement}
                item={itemWithGroupInfo.item}
                index={itemWithGroupInfo.rowIndex}
                groupName={itemWithGroupInfo.groupName}
                isGroupLinked={isGroupLinked}
              />
            </Fragment>
          );
        }
      });
    }
    return virtualRowsData.map((vr) => {
      const item = processedItems[vr.index];
      return (
        <BaseTableRow
          dataIndex={vr.index}
          ref={virtualizer.virtualizer.measureElement}
          item={item}
          index={vr.index}
          isGroupLinked={isGroupLinked}
        />
      );
    });
  }, [
    virtualizer.virtualRows,
    virtualizer.virtualizer.measureElement,
    props,
    flatGroupedItemsWithoutCollapsed,
    filteredItemsByGroup,
    processedLeafHeaders.length,
    advancedSettings?.showIndex,
    collapsedGroups,
    collapseGroup,
    isGroupLinked,
    processedItems,
  ]);

  return (
    <>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          itemCoordinate={contextMenu.cellCoordinate}
          header={contextMenu.header}
          onClose={() => setContextMenu(undefined)}
        />
      )}

      {/* {activeFilters.length > 0 && (
        <div style={{ width: "100%", display: "flex" }}>
          <BaseButton
            onClick={clearActiveFilters}
            className="mb-1 h-5 min-h-5 w-36 flex"
            small
            text="Clear all filters"
            iconSize={0.6}
            icon={mdiFilterOff}
          />
        </div>
      )} */}

      <div
        ref={scrollRef}
        className="overflow-auto h-min"
        style={{
          overflow: "auto", //our scrollable table container
          border: "1px solid lightgray",
          height: props.height
            ? `calc(${props.height} - ${
                advancedSettings?.showFooter ? "20px" : "0rem"
              })`
            : `calc(100vh - ${
                advancedSettings?.marginTop
                  ? advancedSettings?.marginTop
                  : "6rem"
              } - ${advancedSettings?.showFooter ? "20px" : "0rem"})`, //should be a fixed height
          // scrollbarWidth: "thin",
        }}
      >
        {openedDialogs.map((dialog) => (
          <DialogWrapper dialogItem={dialog} />
        ))}
        <table
          ref={tableRef}
          onMouseMove={onMouseMove}
          id={advancedSettings?.tableId ?? TABLE_ID}
          style={{
            width: "100%",
            position: "unset",
            userSelect: isDragging ? "none" : "auto",
            WebkitUserSelect: isDragging ? "none" : "auto",
            MozUserSelect: isDragging ? "none" : "auto",
            msUserSelect: isDragging ? "none" : ("auto" as any),
          }}
          className={`base-table table table-xs table-pin-rows 
             ${" will-change-transform overflow-contain transform-gpu "} 
             ${advancedSettings?.pinColumns ? " table-pin-cols" : ""}  `}
        >
          <BaseTableHeaders
            headers={headersWithIndexColumn}
            noBorder={advancedSettings?.noBorder}
            alignCenterInLine={advancedSettings?.alignCenterInLine}
            activeFilters={activeFilters}
            tableRef={tableRef}
            ascendingOrder={ascendingOrder}
            filterItemsCache={filterItemsCache}
            onResetSort={onResetSort}
            onSortByColumn={onSortByColumn}
            onSetFilter={setActiveFilter}
          />

          <tbody>
            {virtualizer.before > 0 && (
              <tr style={{ height: virtualizer.before }}>
                <td
                  colSpan={
                    processedLeafHeaders.length +
                    (advancedSettings?.showIndex ? 1 : 0)
                  }
                  style={{ height: virtualizer.before }}
                />
              </tr>
            )}
            {virtualRowsRendered}

            {virtualizer.after > 0 && (
              <tr>
                <td
                  colSpan={
                    processedLeafHeaders.length +
                    (advancedSettings?.showIndex ? 1 : 0)
                  }
                  style={{ height: virtualizer.after }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BaseTableFooter
        itemsCount={props.items.length}
        filteredItemsCount={displayedRowsCountWithoutGroups}
        colSpan={
          processedLeafHeaders.length + (advancedSettings?.showIndex ? 1 : 0)
        }
      />
    </>
  );
}
