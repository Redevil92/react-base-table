import { useState } from "react";
import type BaseTableHeader from "./models/BaseTableHeaders";
import type ActiveTableFilter from "./models/ActiveTableFilter";
import TableFilter from "./TableFilter";

import { mdiArrowDown, mdiArrowUp, mdiCloseCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { FilterTypes } from "../../enum/FilterTypes";

export interface BaseTableHeadersProps {
  headers: BaseTableHeader[];
  noBorder?: boolean;
  alignCenterInLine?: boolean;
  currentSortId?: string;
  activeFilters?: ActiveTableFilter[];
  filterItemsCache: Record<string, (string | number)[]>;
  ascendingOrder?: boolean;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  // showIndex?: boolean;
  onResetSort?: () => void;
  onSetFilter?: (headerId: string, itemsToHide: string[] | number[]) => void;
  onSortByColumn?: (header: BaseTableHeader) => void;
}

export default function BaseTable(props: Readonly<BaseTableHeadersProps>) {
  const [filterToShow, setFilterToShow] = useState("");

  const showFilterHandler = (show: boolean, filterId: string) => {
    if (!show) {
      setFilterToShow("");
      return;
    }
    setFilterToShow(filterId);
  };

  const getFilterForHeader = (headerId: string) => {
    if (!props.activeFilters) return undefined;
    return props.activeFilters.find((filter) => filter.headerId === headerId);
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

  const getFilterItemsForHeader = (headerId: string): string[] | number[] => {
    return (props.filterItemsCache[headerId] as string[] | number[]) ?? [];
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
      <tr key={`header-row-${currentLevel}`} className="z-100">
        {headers.map((header, index) => {
          const colSpan = getColSpan(header);
          const hasChildren = header.children && header.children.length > 0;
          const rowSpan = hasChildren ? 1 : depth - currentLevel;

          return (
            <th
              key={header.id + `-${index}`}
              colSpan={colSpan}
              rowSpan={rowSpan}
              className={`${
                !props.noBorder
                  ? "border-solid border border-gray-300! bg-slate-100"
                  : ""
              }`}
            >
              <div
                style={{ width: header.width ? `${header.width}px` : "auto" }}
                className="flex justify-between"
              >
                <div className="flex">
                  {header.customHeader ? (
                    header.customHeader(header)
                  ) : (
                    <button
                      onClick={() => props.onSortByColumn?.(header)}
                      className={`font-semibold bg-transparent text-left text-slate-600 text-xs border-none outline-hidden! whitespace-pre ${
                        header.sortable
                          ? "cursor-pointer hover:underline"
                          : "cursor-default"
                      }`}
                    >
                      {header.text}
                    </button>
                  )}

                  {props.currentSortId === header.id && (
                    <>
                      <Icon
                        path={props.ascendingOrder ? mdiArrowUp : mdiArrowDown}
                        color={"grey"}
                        size={0.6}
                      />
                      <button
                        onClick={props.onResetSort}
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
                      tableRef={props.tableRef}
                      currentFilter={getFilterForHeader(header.id)}
                      filterName={header.text}
                      headerId={header.id}
                      filterType={FilterTypes.STRING}
                      items={getFilterItemsForHeader(header.id)}
                      itemsToHide={
                        props.activeFilters?.find(
                          (filter) => filter.headerId === header.id
                        )?.itemsToHide ?? []
                      }
                      onShowOrHide={(show: boolean) =>
                        showFilterHandler(show, header.id)
                      }
                      onSetFilter={props.onSetFilter ?? (() => {})}
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

  return <thead>{renderAllHeaderRows(props.headers, headerDepth)}</thead>;
}
