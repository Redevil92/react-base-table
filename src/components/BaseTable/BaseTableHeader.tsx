import type BaseTableHeader from "./models/BaseTableHeaders";
import TableFilter from "./tableFilter/TableFilter";

import { mdiArrowDown, mdiArrowUp, mdiCloseCircle } from "@mdi/js";
import Icon from "@mdi/react";

import { FilterTypes } from "../../enum/FilterTypes";
import {
  useActiveFilters,
  useAdvancedSettings,
  useAscendingOrder,
  useCurrentSortId,
  useFilterItemsCache,
  useTableDataActions,
} from "../../stores/tableDataStore";
import { memo } from "react";
import { useContextMenuActions } from "../../stores/contextMenuStore";
import { TableHeaderType } from "./models/BaseTableHeaders";

export interface TableHeaderProps {
  header: BaseTableHeader;
  colSpan: number;
  rowSpan: number;
  index: number;
  showFilter: boolean;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  style?: React.CSSProperties;
  onShowFilter: (show: boolean, filterId: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = memo((props) => {
  const currentSortId = useCurrentSortId();
  const activeFilters = useActiveFilters();
  const filterItemsCache = useFilterItemsCache();
  const advancedSettings = useAdvancedSettings();
  const ascendingOrder = useAscendingOrder();
  const { setContextMenu } = useContextMenuActions();

  const { setActiveFilter, onResetSort, onSortByColumn } =
    useTableDataActions();

  const getFilterItemsForHeader = (headerId: string): string[] | number[] => {
    return (filterItemsCache[headerId] as string[] | number[]) ?? [];
  };

  const getFilterForHeader = (headerId: string) => {
    if (!activeFilters) return undefined;
    return activeFilters.find((filter) => filter.headerId === headerId);
  };

  const getFilterType = (
    header: BaseTableHeader,
    items: (string | number | null | undefined)[]
  ): FilterTypes => {
    // First check edit options if available
    if (header.editOptions?.type) {
      switch (header.editOptions.type) {
        case TableHeaderType.NUMBER:
          return FilterTypes.NUMBER;

        default:
          return FilterTypes.STRING;
      }
    }

    // Get first 10 non-null/undefined items
    const validItems: (string | number)[] = [];
    let i = 0;

    while (validItems.length < 10 && i < items.length) {
      const item = items[i];
      if (item !== null && item !== undefined) {
        validItems.push(item);
      }
      i++;
    }

    if (validItems.length === 0) {
      return FilterTypes.STRING; // Default when no valid data
    }

    // Check if ALL items are numbers (including string numbers)
    const allNumbers = validItems.every((item) => {
      if (typeof item === "number") return true;
      if (typeof item === "string") {
        return !isNaN(Number(item)) && item.trim() !== "";
      }
      return false;
    });

    return allNumbers ? FilterTypes.NUMBER : FilterTypes.STRING;
  };

  return (
    <th
      key={props.header.id + `-${props.index}`}
      colSpan={props.colSpan}
      rowSpan={props.rowSpan}
      className={`${
        !advancedSettings?.noBorder
          ? `border-solid border-b  border-r border-gray-300! bg-gray-50`
          : ""
      }`}
      style={{ ...props.style }}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          header: props.header,
        });
      }}
    >
      <div
        style={{
          width: props.header.width ? `${props.header.width}px` : "auto",
        }}
        className="flex justify-between"
      >
        <div className="flex">
          {props.header.customHeader ? (
            props.header.customHeader(props.header)
          ) : (
            <button
              onClick={() => onSortByColumn?.(props.header)}
              className={`font-semibold bg-transparent text-left text-slate-600 text-xs border-none outline-hidden! whitespace-pre ${
                props.header.sortable
                  ? "cursor-pointer hover:underline"
                  : "cursor-default"
              }`}
            >
              {props.header.text}
            </button>
          )}

          {currentSortId === props.header.id && (
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

        {props.header.hasFilter ? (
          <div className="ml-2">
            <TableFilter
              show={props.showFilter}
              tableRef={props.tableRef}
              currentFilter={getFilterForHeader(props.header.id)}
              filterName={props.header.text}
              headerId={props.header.id}
              filterType={getFilterType(
                props.header,
                getFilterItemsForHeader(props.header.id)
              )}
              items={getFilterItemsForHeader(props.header.id)}
              itemsToHide={
                activeFilters?.find(
                  (filter) => filter.headerId === props.header.id
                )?.itemsToHide ?? []
              }
              onShowOrHide={(show: boolean) =>
                props.onShowFilter(show, props.header.id)
              }
              onSetFilter={setActiveFilter}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </th>
  );
});

export default TableHeader;

