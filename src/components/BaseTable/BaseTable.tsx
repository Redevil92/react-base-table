import {
  CSSProperties,
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import BaseTableHeader from "./models/BaseTableHeaders";
import TableItem from "./models/TableItem";
import ActiveTableFilter from "./models/ActiveTableFilter";

import { mdiFilterOff } from "@mdi/js";
import BaseButton from "../BaseButton";
import BaseTableCell from "./BaseTableCell";
import BaseTableHeaders from "./BaseTableHeaders";
import useTableData from "./hooks/useTableData";
import useTableGrouping from "./hooks/useTableGrouping";
import { useTableInteractions } from "./hooks/useTableInteractions";
import { useVirtualRows } from "./hooks/useVirtualRows";
import ItemWithGroupInfo from "./models/ItemWithGroupInfo";
import BaseTableGroupRow from "./BaseTableGroupRow";

export interface BaseTableProps<T> {
  height?: string;
  headers: BaseTableHeader[];
  items: TableItem[];
  marginTop?: string;
  noBorder?: boolean;
  pinColumns?: boolean;
  alignCenterInLine?: boolean;
  currentSortId?: string;
  highlightCondition?: {
    propertyId: string;
    value: unknown;
    style: CSSProperties;
  }[];
  showIndex?: boolean;
  indexUseOriginalOrder?: boolean; // If true, uses original order from props.items, otherwise uses grouped order
  contrastRow?: boolean;
  activeFilters?: ActiveTableFilter[];
  groupBy?: string;
  linkedGroups?: { master: string; linked: string[] }[];
  onChange?: (itemUpdated: T, originalIndex: number) => void;
  onBulkChange?: (items: { itemUpdated: T; originalIndex: number }[]) => void;
  groupByCustomRender?: (groupBy: string, value: string) => ReactNode;
  onResetSort?: () => void;
  onRowDoubleClick?: (item: T) => void;
  onSortByColumn?: (columnId: string) => void;
}

export default function BaseTable<T extends TableItem>(
  props: Readonly<BaseTableProps<T>>
) {
  const tableRef = useRef<HTMLTableElement>(null);

  // const [collapsedGroups, setCollapsedGroup] = useState<string[]>([]);

  const originalIndexMap = useMemo(() => {
    const map = new Map();
    props.items.forEach((item, index) => {
      map.set(item, index + 1); // +1 for 1-based indexing
    });
    return map;
  }, [props.items]);

  const headersWithIndexColumn = useMemo<BaseTableHeader[]>(() => {
    if (props.showIndex) {
      return [
        {
          id: "_index",
          text: "",
          sortable: false,
          align: "right",
          children: [],
          width: 30,
        },
        ...props.headers,
      ];
    }
    return props.headers;
  }, [props.headers, props.showIndex]);

  function getLeafHeaders(headers: BaseTableHeader[]): BaseTableHeader[] {
    return headers.flatMap((h) =>
      h.children && h.children.length > 0 ? getLeafHeaders(h.children) : [h]
    );
  }

  const leafHeaders = useMemo(
    () => getLeafHeaders(props.headers),
    [props.headers]
  );

  const onRowDoubleClick = (item: TableItem) => {
    if (props.onRowDoubleClick) {
      props.onRowDoubleClick(item as T);
    }
  };

  const {
    activeFilters,
    clearActiveFilters,
    setActiveTableFilter,
    filterItemsCache,
    currentSortId,
    ascendingOrder,
    onResetSort,
    onSortByColumn,
    processedItems: filteredItems,
  } = useTableData(
    props.items,
    props.headers,
    props.activeFilters ?? [],
    props.currentSortId,
    props.onSortByColumn
  );

  const {
    groupedItemsEntries,
    collapsedGroups,
    flatGroupedItemsToDisplay,
    onCollapseGroup,
    isGroupLinked,
  } = useTableGrouping(filteredItems, props.groupBy, props.linkedGroups);

  const {
    selectedCell,
    expandedSelection,
    isDragging,
    onCellBlur,
    onCellEnter,
    onCellClick,
    handleCellKeyDown,
    onCellMouseDown,
    onCellMouseEnter,
    onMouseMove,
  } = useTableInteractions({
    headers: leafHeaders,
    items: props.items,
    groupedItemsEntries: props.groupBy ? groupedItemsEntries : undefined,
    onChange: props.onChange,
    onBulkChange: props.onBulkChange,
    onRowDoubleClick: props.onRowDoubleClick,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const displayedRowsCount = useMemo(() => {
    if (!props.groupBy) {
      return filteredItems.length;
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
  }, [filteredItems, groupedItemsEntries, collapsedGroups, props.groupBy]);

  const { virtualRows, before, after } = useVirtualRows({
    scrollRef: scrollRef,
    rowsCount: displayedRowsCount,
  });

  const collapseGroupHandler = (group: string) => {
    console.log("Collapse group handler called for group:", group);
    onCollapseGroup(group);
  };

  const getRowStyle = (row: TableItem) => {
    const style = props.highlightCondition?.find(
      (condition) => row[condition.propertyId] === condition.value
    );

    if (!style) {
      return {};
    }

    return style.style;
  };

  const renderIndexCell = (rowIndex: number, item: TableItem) => {
    return (
      <td className="text-right pr-4 bg-gray-100 font-medium">
        {props.groupBy
          ? props.indexUseOriginalOrder
            ? originalIndexMap.get(filteredItems[rowIndex])
            : rowIndex + 1
          : originalIndexMap.get(item)}
      </td>
    );
  };

  const handleCellMouseDown = useCallback(
    (
      e: React.MouseEvent<HTMLTableCellElement>,
      rowIndex: number,
      columnIndex: number
    ) => {
      onCellMouseDown(e, rowIndex, columnIndex);
    },
    [onCellMouseDown]
  );

  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIndex: number,
    columnIndex: number
  ) => {
    onCellMouseEnter(e, rowIndex, columnIndex);
  };

  const renderBaseTableCell = (
    item: TableItem,
    header: BaseTableHeader,
    rowIndex: number,
    columnIndex: number,
    disabled?: boolean
  ) => {
    return (
      <BaseTableCell
        isSelected={
          selectedCell?.rowIndex === rowIndex &&
          selectedCell?.columnIndex === columnIndex
        }
        disabled={disabled}
        isInExpandedSelection={
          expandedSelection?.some(
            (cell) =>
              cell.rowIndex === rowIndex && cell.columnIndex === columnIndex
          ) || false
        }
        key={`item-${rowIndex}-${columnIndex}`}
        header={header}
        item={item}
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        noBorder={props.noBorder}
        contrastRow={props.contrastRow}
        onClick={onCellClick}
        onEnter={onCellEnter}
        onBlur={onCellBlur}
        onKeyDown={handleCellKeyDown}
        onMouseDown={(e) => handleCellMouseDown(e, rowIndex, columnIndex)}
        onMouseEnter={(e) => handleCellMouseEnter(e, rowIndex, columnIndex)}
      />
    );
  };

  return (
    <>
      {activeFilters.length > 0 && (
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
      )}
      {expandedSelection.length}
      {" - items: "}
      {filteredItems.length}
      {" - v. rows: "}
      {virtualRows.length}
      {" - before: "}
      {before}
      {" - after: "}
      {after}
      <div
        ref={scrollRef}
        className="overflow-auto h-min"
        style={{
          overflow: "auto", //our scrollable table container
          // position: 'relative', //needed for sticky header
          height:
            props.height ??
            `calc(100vh - ${props.marginTop ? props.marginTop : "6rem"})`, //should be a fixed height
          scrollbarWidth: "thin",
        }}
      >
        <table
          ref={tableRef}
          onMouseMove={onMouseMove}
          style={{
            width: "100%",
            position: "unset",
            userSelect: isDragging ? "none" : "auto",
            WebkitUserSelect: isDragging ? "none" : "auto",
          }}
          className={`table table-xs table-pin-rows ${
            props.pinColumns ? "table-pin-cols" : ""
          }  border border-gray-300!`}
          // onKeyDown={(e) =>
          //   handleCellKeyDown(
          //     e,
          //     selectedCell?.rowIndex ?? 0,
          //     selectedCell?.columnIndex ?? 0,
          //     filteredItems.length,
          //     leafHeaders.length
          //   )
          // }
        >
          <BaseTableHeaders
            headers={headersWithIndexColumn}
            noBorder={props.noBorder}
            alignCenterInLine={props.alignCenterInLine}
            currentSortId={currentSortId}
            activeFilters={activeFilters}
            tableRef={tableRef}
            ascendingOrder={ascendingOrder}
            filterItemsCache={filterItemsCache}
            onResetSort={onResetSort}
            onSortByColumn={onSortByColumn}
            onSetFilter={setActiveTableFilter}
          />

          <tbody>
            {before > 0 && (
              <tr>
                <td colSpan={leafHeaders.length} style={{ height: before }} />
              </tr>
            )}
            {props.groupBy ? (
              <>
                {virtualRows.map((virtualRows) => {
                  const itemOrGroup =
                    flatGroupedItemsToDisplay[virtualRows.index];

                  if (itemOrGroup.isGroup === true) {
                    return (
                      <Fragment key={`group-${itemOrGroup.groupName}`}>
                        <BaseTableGroupRow
                          colSpan={
                            leafHeaders.length + (props.showIndex ? 1 : 0)
                          }
                          groupBy={props.groupBy!}
                          groupName={itemOrGroup.groupName}
                          isCollapsed={collapsedGroups.includes(
                            itemOrGroup.groupName
                          )}
                          onCollapseGroup={() =>
                            collapseGroupHandler(itemOrGroup.groupName)
                          }
                          groupByCustomRender={props.groupByCustomRender}
                        />
                      </Fragment>
                      // <tr
                      //   key={`group-${virtualRows.index}`}
                      //   className="bg-purple-50"
                      // >
                      //   {props.groupByCustomRender ? (
                      //     props.groupByCustomRender(
                      //       props.groupBy!,
                      //       itemOrGroup.groupName
                      //     )
                      //   ) : (
                      //     <td
                      //       colSpan={
                      //         leafHeaders.length + (props.showIndex ? 1 : 0)
                      //       }
                      //       className="font-semibold"
                      //     >
                      //       <button
                      //         onClick={() =>
                      //           onCollapseGroup(itemOrGroup.groupName)
                      //         }
                      //         className="btn btn-xs btn-circle btn-primary mr-2"
                      //       >
                      //         {collapsedGroups.includes(
                      //           itemOrGroup.groupName
                      //         ) ? (
                      //           <span>+</span>
                      //         ) : (
                      //           <span>-</span>
                      //         )}
                      //       </button>
                      //       <span>{itemOrGroup.groupName}</span>
                      //     </td>
                      //   )}
                      // </tr>
                    );
                  } else {
                    const itemWithGroupInfo = itemOrGroup as ItemWithGroupInfo;
                    return (
                      <tr
                        style={getRowStyle(itemWithGroupInfo.item)}
                        className={`${
                          props.onRowDoubleClick ? "cursor-pointer" : ""
                        }  hover:outline-1 hover:outline-solid  hover:outline-[#484ab963]`}
                        onDoubleClick={() =>
                          onRowDoubleClick(itemWithGroupInfo.item)
                        }
                        key={`item-${itemWithGroupInfo.rowIndex}`}
                      >
                        {renderIndexCell(
                          itemWithGroupInfo.rowIndex,
                          itemWithGroupInfo.item
                        )}

                        {leafHeaders.map((header, j) =>
                          renderBaseTableCell(
                            itemWithGroupInfo.item,
                            header,
                            itemWithGroupInfo.rowIndex,
                            j,
                            isGroupLinked(itemWithGroupInfo.groupName)
                          )
                        )}
                      </tr>
                    );
                  }
                })}
              </>
            ) : (
              <>
                {virtualRows.map((virtualRows) => {
                  const item = filteredItems[virtualRows.index];
                  return (
                    <tr
                      style={getRowStyle(item)}
                      className={`${
                        props.onRowDoubleClick ? "cursor-pointer" : ""
                      }  hover:outline-1 hover:outline-solid  hover:outline-[#4849b9fa]`}
                      onDoubleClick={() => onRowDoubleClick(item)}
                      key={`item-${virtualRows.index}`}
                    >
                      {renderIndexCell(virtualRows.index, item)}
                      {leafHeaders.map((header, j) =>
                        renderBaseTableCell(item, header, virtualRows.index, j)
                      )}
                    </tr>
                  );
                })}
              </>
            )}
            {after > 0 && (
              <tr>
                <td colSpan={leafHeaders.length} style={{ height: after }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
