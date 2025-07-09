import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import BaseTableHeader from "./models/BaseTableHeaders";
import TableItem from "./models/TableItem";
import ActiveTableFilter from "./models/ActiveTableFilter";
import TableFilter from "./TableFilter";

import {
  mdiArrowDown,
  mdiArrowUp,
  mdiCloseCircle,
  mdiFilterOff,
} from "@mdi/js";
import Icon from "@mdi/react";
import BaseButton from "../BaseButton";
import { FilterTypes } from "../../enum/FilterTypes";
import { filterItems, sortItems } from "./BaseTableFunctions";
import CustomRenderItem from "./CustomRenderItem";

export interface BaseTableProps {
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
  activeFilters?: ActiveTableFilter[];
  onResetSort?: () => void;
  onRowDoubleClick?: (item: TableItem) => void;
  onSortByColumn?: (columnId: string) => void;
}

export default function BaseTable(props: Readonly<BaseTableProps>) {
  const [filterToShow, setFilterToShow] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveTableFilter[]>(
    props.activeFilters ?? []
  );

  const tableRef = useRef<HTMLTableElement>(null);

  const [currentSortId, setCurrentSortId] = useState<string | undefined>(
    props.currentSortId
  );

  useEffect(() => {
    setCurrentSortId(props.currentSortId);
  }, [props.currentSortId]);

  const [ascendingOrder, setAscendingOrder] = useState(true);

  const clearActiveFilters = () => {
    setActiveFilters([]);
  };

  const filteredItems = useMemo(() => {
    let items = [...props.items];

    items = filterItems(items, activeFilters);
    items = sortItems(
      items,
      props.headers,
      ascendingOrder ? "asc" : "desc",
      currentSortId
    );

    return items;
  }, [
    currentSortId,
    props.items,
    props.headers,
    ascendingOrder,
    activeFilters,
  ]);

  const showFilterHandler = (show: boolean, filterId: string) => {
    if (!show) {
      setFilterToShow("");
      return;
    }
    setFilterToShow(filterId);
  };

  const getFilterForHeader = (headerId: string) => {
    return activeFilters.find((filter) => filter.headerId === headerId);
  };

  const setActiveTableFilters = (
    headerId: string,
    itemsToHide: string[] | number[]
  ) => {
    const filters = [...activeFilters];
    const index = filters.findIndex((filter) => filter.headerId === headerId);

    if (index !== -1) {
      if (itemsToHide.length > 0) {
        //update filter
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

  function renderAllHeaderRows(
    headers: BaseTableHeader[],
    depth: number,
    currentLevel = 0
  ): React.ReactNode[] {
    const row = renderHeaderRows(headers, depth, currentLevel);
    const children = headers
      .filter((h) => h.children && h.children.length > 0)
      .map((h) => h.children!)
      .flat();
    if (children.length > 0) {
      return [row, ...renderAllHeaderRows(children, depth, currentLevel + 1)];
    }
    return [row];
  }

  function getLeafHeaders(headers: BaseTableHeader[]): BaseTableHeader[] {
    return headers.flatMap((h) =>
      h.children && h.children.length > 0 ? getLeafHeaders(h.children) : [h]
    );
  }

  const leafHeaders = useMemo(
    () => getLeafHeaders(props.headers),
    [props.headers]
  );

  const filterItemsCache = useMemo(() => {
    const cache: Record<string, (string | number)[]> = {};
    leafHeaders.forEach((header) => {
      let items = filteredItems.map((item) => item[header.id]);
      const currentFilter = activeFilters.find(
        (filter) => filter.headerId === header.id
      );
      if (currentFilter) {
        items = items.concat(currentFilter.itemsToHide);
      }
      // Only keep string, number, or undefined
      cache[header.id] = [...new Set(items)].filter(
        (item): item is string | number =>
          typeof item === "string" || typeof item === "number"
      );
    });
    console.log("Filter items cache:", cache);
    return cache;
  }, [filteredItems, activeFilters, leafHeaders]);

  const getFilterItemsForHeader = (headerId: string): string[] | number[] => {
    return (filterItemsCache[headerId] as string[] | number[]) ?? [];
  };

  const onRowDoubleClick = (item: TableItem) => {
    if (props.onRowDoubleClick) {
      props.onRowDoubleClick(item);
    }
  };

  const onResetSort = () => {
    setCurrentSortId(undefined);
    setAscendingOrder(true);
    props.onResetSort?.();
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

    props.onSortByColumn?.(header.id);
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

  function getHeaderDepth(headers: BaseTableHeader[]): number {
    return headers.reduce((max, h) => {
      if (h.children && h.children.length > 0) {
        return Math.max(max, 1 + getHeaderDepth(h.children));
      }
      return Math.max(max, 1);
    }, 0);
  }

  function getColSpan(header: BaseTableHeader): number {
    if (header.children && header.children.length > 0) {
      return header.children.reduce((sum, child) => sum + getColSpan(child), 0);
    }
    return 1;
  }

  function renderHeaderRows(
    headers: BaseTableHeader[],
    depth: number,
    currentLevel = 0
  ): React.ReactNode {
    if (headers.length === 0) return null;
    return (
      <tr>
        {headers.map((header, index) => {
          const colSpan = getColSpan(header);
          const hasChildren = header.children && header.children.length > 0;
          const rowSpan = hasChildren ? 1 : depth - currentLevel;

          return (
            <th
              key={header.id + `-${index}`}
              colSpan={colSpan}
              rowSpan={rowSpan}
              className={`${!props.noBorder ? "border-solid border border-gray-300! bg-slate-100" : ""}`}
            >
              <div className="flex justify-between">
                <div className="flex">
                  {header.customHeader ? (
                    header.customHeader(header)
                  ) : (
                    <button
                      onClick={() => onSortByColumn(header)}
                      className={`font-semibold bg-transparent text-left text-slate-600 text-xs border-none outline-hidden! whitespace-pre ${
                        header.sortable
                          ? "cursor-pointer hover:underline"
                          : "cursor-default"
                      }`}
                    >
                      {header.text}
                    </button>
                  )}

                  {currentSortId === header.id && (
                    <>
                      <Icon
                        path={ascendingOrder ? mdiArrowUp : mdiArrowDown}
                        color={"grey"}
                        size={0.6}
                      />
                      <button
                        onClick={onResetSort}
                        className={`border-solid border bg-slate-300 hover:bg-slate-400! hover:border-transparent cursor-pointer  rounded-lg h-min  focus:outline-hidden!
                         `}
                      >
                        <Icon path={mdiCloseCircle} color={"grey"} size={0.6} />
                      </button>
                    </>
                  )}
                </div>

                {header.hasFilter ? (
                  <div className="ml-2">
                    <TableFilter
                      show={filterToShow === header.id}
                      tableRef={tableRef}
                      currentFilter={getFilterForHeader(header.id)}
                      filterName={header.text}
                      headerId={header.id}
                      filterType={FilterTypes.STRING}
                      items={getFilterItemsForHeader(header.id)}
                      itemsToHide={
                        activeFilters.find(
                          (filter) => filter.headerId === header.id
                        )?.itemsToHide ?? []
                      }
                      onShowOrHide={(show: boolean) =>
                        showFilterHandler(show, header.id)
                      }
                      onSetFilter={setActiveTableFilters}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    );
  }

  const headerDepth = getHeaderDepth(props.headers);

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

      <div
        className="overflow-x-auto"
        style={{
          overflow: "auto", //our scrollable table container
          // position: 'relative', //needed for sticky header
          height:
            props.height ??
            `calc(100vh - ${props.marginTop ? props.marginTop : "4rem"})`, //should be a fixed height
          scrollbarWidth: "thin",
        }}
      >
        <table
          ref={tableRef}
          style={{ width: "100%", position: "unset" }}
          className={`table table-xs table-pin-rows ${
            props.pinColumns ? "table-pin-cols" : ""
          }  border border-gray-300!`}
        >
          <thead>{renderAllHeaderRows(props.headers, headerDepth)}</thead>

          <tbody>
            {filteredItems.map((item, i) => (
              <tr
                style={getRowStyle(item)}
                className={`${
                  props.onRowDoubleClick ? "cursor-pointer" : ""
                }  hover:outline-1 hover:outline-solid  hover:outline-[#4849b9fa]`}
                onDoubleClick={() => onRowDoubleClick(item)}
                key={`item-${i}`}
              >
                {leafHeaders.map((header, j) => (
                  <td
                    key={`item-${j}-${header.id}`}
                    className={` ${!props.noBorder ? "border-solid border  " : ""}  
                  ${props.alignCenterInLine && j === 0 ? "text-center" : ""}
                  ${i % 2 ? "" : "bg-blue-50/50"} `}
                  >
                    {header.customRender ? (
                      <CustomRenderItem item={item} header={header} />
                    ) : (
                      (item as TableItem)[header.id]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
