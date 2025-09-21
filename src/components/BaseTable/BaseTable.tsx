import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type BaseTableHeader from "./models/BaseTableHeaders";
import type TableItem from "./models/TableItem";
import type ActiveTableFilter from "./models/ActiveTableFilter";

import {
  mdiCloseThick,
  mdiCommentPlus,
  mdiDrag,
  mdiFilterOff,
  mdiFormatColorFill,
} from "@mdi/js";
import BaseButton from "../BaseButton";
import BaseTableCell from "./BaseTableCell";
import BaseTableHeaders from "./BaseTableHeaders";
import useTableData from "./hooks/useTableData";
import useTableGrouping from "./hooks/useTableGrouping";
import { useTableInteractions } from "./hooks/useTableInteractions";
import { useVirtualRows } from "./hooks/useVirtualRows";
import type ItemWithGroupInfo from "./models/ItemWithGroupInfo";
import BaseTableGroupRow from "./BaseTableGroupRow";
import type HighlightCondition from "./models/HighlightCondition";
import ContextMenu from "./ContextMenu";
import type CommentData from "./models/CommentData";
import type CellCoordinate from "./models/CellCordinate";

import { useCommentPopupContext } from "./contexts/useCommentPopupContext";
import ColorPicker from "../ColorPicker";
import { useRowDragDrop } from "./hooks/useRowDragDrop";
import Icon from "@mdi/react";

export interface BaseTableProps<T> {
  height?: string;
  headers: BaseTableHeader[];
  items: TableItem[];
  marginTop?: string;
  noBorder?: boolean;
  pinColumns?: boolean;
  alignCenterInLine?: boolean;
  currentSortId?: string;
  highlightCondition?: HighlightCondition[];
  comments?: CommentData[];
  showIndex?: boolean;
  indexUseOriginalOrder?: boolean; // If true, uses original order from props.items, otherwise uses grouped order
  contrastRow?: boolean;
  activeFilters?: ActiveTableFilter[];
  groupBy?: string;
  currentUsername?: string;
  linkedGroups?: { master: string; linked: string[] }[];
  enableRowDragDrop?: boolean;
  onSetHighlightCondition?: (
    highlightCondition: HighlightCondition,
    item: TableItem
  ) => void;
  onRemoveHighlightCondition?: (
    highlightCondition: HighlightCondition,
    cssPropertyToRemove: keyof CSSProperties,
    item: TableItem
  ) => void;
  onSaveComment?: (comment: CommentData, item: TableItem) => void;
  onDeleteComment?: (comment: CommentData, item: TableItem) => void;
  onChange?: (
    itemUpdated: T,
    originalIndex: number,
    fromArrayIndex?: number
  ) => void;
  onBulkChange?: (
    items: { itemUpdated: T; originalIndex: number }[],
    headerId: string
  ) => void;
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
  onResetSort?: () => void;
  onRowDoubleClick?: (item: T) => void;
  onSortByColumn?: (columnId: string) => void;
  onAddListOption?: (newOption: string, header: BaseTableHeader) => void;
  onRowsReordered?: (fromIndex: number, toIndex: number) => void;
}

export default function BaseTable<T extends TableItem>(
  props: Readonly<BaseTableProps<T>>
) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    rowIndex: number;
    columnIndex: number;
    item: TableItem;
    header: BaseTableHeader;
  } | null>(null);

  const { setOpenCommentCell, setUsername } = useCommentPopupContext();

  useEffect(() => {
    setUsername?.(props.currentUsername ?? "Anonymous");
  }, [props.currentUsername]);

  const originalIndexMap = useMemo(() => {
    const map = new Map();
    props.items.forEach((item, index) => {
      map.set(item, index + 1);
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
          width: props.enableRowDragDrop ? 55 : 40,
        },
        ...props.headers,
      ];
    }
    return props.headers;
  }, [props.headers, props.showIndex, props.enableRowDragDrop]);

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

  const deleteCommentHandler = useCallback(
    (comment: CommentData, item: TableItem) => {
      if (props.onDeleteComment) {
        props.onDeleteComment(comment, item);
      }
    },
    [props.onSaveComment, props.items]
  );

  const saveCommentHandler = useCallback(
    (comment: CommentData, item: TableItem) => {
      if (props.onSaveComment) {
        props.onSaveComment(comment, item);
      }
    },
    [props.onSaveComment, props.items]
  );

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
    setExpandedSelection,
    setSelectedCell,
    isDragging,
    onCellBlur,
    onCellEnter,
    onCellClick,
    handleCellKeyDown,
    onCellMouseDown,
    onCellMouseEnter,
    onMouseMove,
    onRightClick,
  } = useTableInteractions({
    headers: leafHeaders,
    items: props.items,
    groupedItemsEntries: props.groupBy ? groupedItemsEntries : undefined,
    onChange: props.onChange,
    onBulkChange: props.onBulkChange,
    onRowDoubleClick: props.onRowDoubleClick,
  });

  // Add drag and drop hook
  const {
    draggedRowIndex,
    dropTargetIndex,
    handleDragEnd,
    handleRowDragStart,
    handleDrop,
    handleRowDragOver,
  } = useRowDragDrop({
    items: filteredItems,
    onRowsReordered: props.onRowsReordered,
    groupBy: props.groupBy,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // reset selection
    setContextMenu(null);
    clearActiveFilters();
    setSelectedCell(undefined);
    setExpandedSelection([]);
  }, [props.headers]);

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

  const handleCellContextMenu = (
    rowIndex: number,
    columnIndex: number,
    item: TableItem,
    event: React.MouseEvent
  ) => {
    // Your right-click logic here
    onRightClick(rowIndex, columnIndex, event);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      rowIndex,
      columnIndex,
      item,
      header: leafHeaders[columnIndex],
    });
  };

  const getRowHighlightConditions = useCallback(
    (row: TableItem): HighlightCondition[] => {
      const conditions = props.highlightCondition?.filter(
        (condition) => row[condition.propertyId] === condition.value
      );
      return conditions || [];
    },
    [props.highlightCondition]
  );

  const getCellHighlightConditions = useCallback(
    (rowConditions: HighlightCondition[], columnId: string): CSSProperties => {
      const conditions = rowConditions.filter(
        (condition) => condition.columnId === columnId
      );

      return conditions.reduce(
        (acc, condition) => ({
          ...acc,
          ...(condition.style || {}),
        }),
        {}
      );
    },
    [props.highlightCondition]
  );

  const renderIndexCell = (
    rowIndex: number,
    item: TableItem,
    rowSpan: number
  ) => {
    const isDropTarget = dropTargetIndex === rowIndex;
    const dropFromAbove =
      draggedRowIndex !== null && draggedRowIndex < rowIndex;

    return (
      <td
        rowSpan={rowSpan}
        style={{ alignContent: "start" }}
        className={`text-right pr-2 bg-gray-100 font-medium relative ${
          props.enableRowDragDrop ? "cursor-grab" : ""
        }`}
        draggable={props.enableRowDragDrop}
        onDragEnd={props.enableRowDragDrop ? handleDragEnd : undefined}
        onDragStart={
          props.enableRowDragDrop
            ? () => handleRowDragStart(rowIndex, item)
            : undefined
        }
        onDrop={props.enableRowDragDrop ? () => handleDrop(item) : undefined}
        onDragOver={
          props.enableRowDragDrop
            ? (e) => {
                e.preventDefault(); // Allow dropping
                handleRowDragOver(rowIndex);
              }
            : undefined
        }
        onDragEnter={
          props.enableRowDragDrop
            ? (e) => {
                e.preventDefault();
                handleRowDragOver(rowIndex);
              }
            : undefined
        }
      >
        {isDropTarget && (
          <div
            style={{
              position: "absolute",
              top: dropFromAbove ? "100%" : 0,
              left: 0,
              width: "100vw", // Extend across the entire viewport width
              height: "2px",
              backgroundColor: "rgb(59, 130, 246)",
              zIndex: 10,
            }}
          />
        )}
        <div className="flex grow items-center justify-between">
          {props.enableRowDragDrop && (
            <Icon path={mdiDrag} color={"grey"} size={0.8} />
          )}
          {props.groupBy
            ? props.indexUseOriginalOrder
              ? originalIndexMap.get(filteredItems[rowIndex])
              : rowIndex + 1
            : originalIndexMap.get(item)}
        </div>
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

  function renderBaseTableCell(
    item: TableItem,
    header: BaseTableHeader,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,

    isInLinkedGroup?: boolean,
    rowStyle?: CSSProperties,
    comments?: CommentData[],
    fromArrayData?: {
      fromArray: string;
      index: number;
    }
  ) {
    return (
      <BaseTableCell
        style={rowStyle}
        isSelected={
          selectedCell?.rowIndex === rowIndex &&
          selectedCell?.columnIndex === columnIndex &&
          selectedCell?.fromArrayData?.index === fromArrayData?.index
        }
        isInLinkedGroup={isInLinkedGroup}
        isInExpandedSelection={
          expandedSelection?.some(
            (cell) =>
              cell.rowIndex === rowIndex &&
              cell.columnIndex === columnIndex &&
              cell.fromArrayData?.index === fromArrayData?.index
          ) || false
        }
        key={`item-${rowIndex}-${columnIndex}`}
        header={header}
        item={item}
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        noBorder={props.noBorder}
        contrastRow={props.contrastRow}
        comments={comments}
        onSaveComment={saveCommentHandler}
        onDeleteComment={deleteCommentHandler}
        onClick={onCellClick}
        onEnter={onCellEnter}
        onBlur={onCellBlur}
        onKeyDown={handleCellKeyDown}
        onMouseDown={(e) => handleCellMouseDown(e, rowIndex, columnIndex)}
        onMouseEnter={(e) => handleCellMouseEnter(e, rowIndex, columnIndex)}
        onContextMenu={handleCellContextMenu}
        onAddOption={props.onAddListOption}
        rowSpan={rowSpan}
        fromArrayData={fromArrayData}
      />
    );
    // );
  }

  function renderRow(item: TableItem, index: number, groupName?: string) {
    const highlightConditions = getRowHighlightConditions(item);

    const comments =
      props.comments?.filter(
        (condition) => item[condition.propertyId] === condition.value
      ) || [];

    const rowStyle = {
      ...highlightConditions
        .filter((condition) => !condition.columnId)
        .reduce(
          (acc, condition) => ({ ...acc, ...(condition.style || {}) }),
          {}
        ),

      opacity: draggedRowIndex === index ? 0.5 : 1,
      backgroundColor:
        dropTargetIndex === index ? "rgba(59, 130, 246, 0.1)" : undefined,
      position: "relative" as "relative",
    };

    // const rowComments = [...comments].filter(
    //   (comment) => comment.columnId === undefined
    // );

    let rowSpan = 0;

    const fromArrayColumn = leafHeaders.filter((h) => h.fromArray);

    if (fromArrayColumn.length > 0) {
      leafHeaders.forEach((header) => {
        if (header.fromArray && Array.isArray(item[header.fromArray])) {
          rowSpan = Math.max(
            rowSpan,
            (item[header.fromArray] as unknown as any[]).length
          );
        }
      });
      rowSpan++;
    }

    return (
      <>
        <tr
          style={rowStyle}
          className={`${props.onRowDoubleClick ? "cursor-pointer" : ""}`}
          onDoubleClick={() => onRowDoubleClick(item)}
          key={`item-${index}`}
        >
          {/* {dropIndicator} */}
          {props.showIndex &&
            renderIndexCell(index, item, Math.max(rowSpan, 1))}
          {leafHeaders.map((header, j) => {
            const cellStyle = getCellHighlightConditions(
              highlightConditions,
              header.id
            );

            const cellComments = comments.filter(
              (comment) => comment.columnId === header.id
            );

            return renderBaseTableCell(
              item,
              header,
              index,
              j,
              header.fromArray ? 1 : Math.max(rowSpan, 1),
              groupName ? isGroupLinked(groupName) : undefined,
              cellStyle,
              cellComments
              //{}, // fromArrayData
            );
          })}
        </tr>
        {fromArrayColumn.length > 0 &&
          Array.from({ length: rowSpan - 1 }).map((_, rowIdx) => {
            return (
              <tr key={`item-array-${index}-${rowIdx}`}>
                {fromArrayColumn.map((header, j) => {
                  return renderBaseTableCell(
                    item,
                    header,
                    index,
                    j,
                    header.fromArray ? 1 : rowSpan,
                    groupName ? isGroupLinked(groupName) : undefined,
                    {},
                    [],
                    {
                      fromArray: header.fromArray!,
                      index: rowIdx,
                    } // fromArrayData
                  );
                  // <td
                  //   key={`item-array-${index}-${rowIdx}-${header.id}`}
                  //   rowSpan={1}
                  // >
                  //   {item[header.fromArray!] &&
                  //   (item[header.fromArray!] as any[])[rowIdx]
                  //     ? (item[header.fromArray!] as any[])[rowIdx][header.id]
                  //     : ""}
                  // </td>
                })}
              </tr>
            );
          })}
      </>
    );
  }

  const setHighlightCondition = (
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

    props.onSetHighlightCondition?.(highlightCondition, item);
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

    props.onRemoveHighlightCondition?.(
      highlightCondition,
      cssPropertyToRemove,
      item
    );
  };

  const getActionsForCell = (item: TableItem, headerId: string) => {
    const comments =
      props.comments?.filter(
        (condition) =>
          item[condition.propertyId] === condition.value &&
          condition.columnId === headerId
      ) || [];

    const backgroundColorCondition = props.highlightCondition?.find(
      (condition) => {
        return (
          item[condition.propertyId] === condition.value &&
          condition.columnId === headerId &&
          condition.style.backgroundColor
        );
      }
    );

    const backgroundColor = backgroundColorCondition?.style.backgroundColor;

    return [
      {
        icon: mdiCommentPlus,
        iconColor: "var(--comment-color)",
        text: `${comments.length > 0 ? "Edit" : "Add"} a comment`,
        onClick: (_item: TableItem, coordinates: CellCoordinate) => {
          setOpenCommentCell({
            rowIndex: coordinates.rowIndex,
            columnIndex: coordinates.columnIndex,
          });
        },
      },
      {
        icon: mdiFormatColorFill,
        iconColor: "#299b42",
        text: `Set cell color`,
        customRender: () => (
          <>
            <ColorPicker
              initialColor={backgroundColor}
              onColorChange={(color) =>
                setHighlightCondition(item, headerId, {
                  backgroundColor: color,
                })
              }
              onClose={() => setContextMenu(null)}
            />
            {backgroundColor && (
              <BaseButton
                circle
                small
                icon={mdiCloseThick}
                iconSize={0.6}
                iconColor="var(--error-color)"
                className="h-5 min-h-5 "
                onClick={() =>
                  removeHighlightCondition(item, headerId, "backgroundColor")
                }
              ></BaseButton>
            )}
          </>
        ),
        onClick: (_: TableItem, _1: CellCoordinate) => {},
      },
    ];
  };

  return (
    <>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          itemCoordinate={{
            rowIndex: contextMenu.rowIndex,
            columnIndex: contextMenu.columnIndex,
          }}
          onClose={() => setContextMenu(null)}
          actions={getActionsForCell(contextMenu.item, contextMenu.header.id)}
        />
      )}

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

      <div
        ref={scrollRef}
        className="overflow-auto h-min"
        style={{
          overflow: "auto", //our scrollable table container
          height:
            props.height ??
            `calc(100vh - ${props.marginTop ? props.marginTop : "6rem"})`, //should be a fixed height
          // scrollbarWidth: "thin",
        }}
      >
        {/* Col: {selectedCell?.columnIndex}
        <br />
        Row: {selectedCell?.rowIndex} <br />
        ** idx:{selectedCell?.fromArrayData?.index} <br /> */}
        <table
          ref={tableRef}
          onMouseMove={onMouseMove}
          style={{
            width: "100%",
            position: "unset",
            userSelect: isDragging ? "none" : "auto",
            WebkitUserSelect: isDragging ? "none" : "auto",
          }}
          className={`table table-xs table-pin-rows 
             ${
               false
                 ? " will-change-transform touch overflow-contain transform-gpu backface-hidden "
                 : ""
             } 
             ${
               props.pinColumns ? " table-pin-cols" : ""
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
                    const filteredItemsInGroup =
                      flatGroupedItemsToDisplay.filter(
                        (item) =>
                          itemOrGroup.groupName === item.groupName &&
                          !item.isGroup
                      );

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
                          masterGroupName={itemOrGroup.masterGroupName} // Pass master group name if available
                          linkedGroupNames={itemOrGroup.linkedGroupNames} // Pass linked group names if available
                          onCollapseGroup={onCollapseGroup}
                          groupByCustomRender={(groupBy, value) =>
                            props.groupByCustomRender?.(
                              groupBy,
                              value,
                              leafHeaders.length + (props.showIndex ? 1 : 0),
                              itemOrGroup.isCollapsed || false,
                              onCollapseGroup,
                              filteredItemsInGroup as ItemWithGroupInfo[],
                              itemOrGroup.masterGroupName,
                              itemOrGroup.linkedGroupNames
                            )
                          }
                        />
                      </Fragment>
                    );
                  } else {
                    const itemWithGroupInfo = itemOrGroup as ItemWithGroupInfo;
                    //itemWithGroupInfo.rowIndex
                    return renderRow(
                      itemWithGroupInfo.item,
                      itemWithGroupInfo.rowIndex,
                      itemWithGroupInfo.groupName
                    );
                  }
                })}
              </>
            ) : (
              <>
                {virtualRows.map((virtualRows) => {
                  const item = filteredItems[virtualRows.index];
                  return renderRow(item, virtualRows.index);
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

