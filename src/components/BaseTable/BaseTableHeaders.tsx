import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type BaseTableHeader from "./models/BaseTableHeaders";
import type ActiveTableFilter from "./models/ActiveTableFilter";

import TableHeader from "./BaseTableHeader";

export interface BaseTableHeadersProps {
  headers: BaseTableHeader[];
  noBorder?: boolean;
  alignCenterInLine?: boolean;

  activeFilters?: ActiveTableFilter[];
  filterItemsCache: Record<string, (string | number)[]>;
  ascendingOrder?: boolean;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  // showIndex?: boolean;
  onResetSort?: () => void;
  onSetFilter?: (headerId: string, itemsToHide: string[] | number[]) => void;
  onSortByColumn?: (header: BaseTableHeader) => void;
}

export default function BaseTableHeaders(
  props: Readonly<BaseTableHeadersProps>
) {
  const [filterToShow, setFilterToShow] = useState("");

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    const heights = rowRefs.current.map(
      (row) => row?.getBoundingClientRect().height || 0
    );
    setRowHeights(heights);
  }, [props.headers]);

  const showFilterHandler = (show: boolean, filterId: string) => {
    if (!show) {
      setFilterToShow("");
      return;
    }
    setFilterToShow(filterId);
  };

  const headerDepth = useMemo(() => {
    function getHeaderDepth(headers: BaseTableHeader[]): number {
      return headers.reduce((max, h) => {
        if (h.children && h.children.length > 0) {
          return Math.max(max, 1 + getHeaderDepth(h.children));
        }
        return Math.max(max, 1);
      }, 0);
    }

    return getHeaderDepth(props.headers);
  }, [props.headers]);

  const getColSpan = useCallback((header: BaseTableHeader): number => {
    if (header.children && header.children.length > 0) {
      return header.children.reduce((sum, child) => sum + getColSpan(child), 0);
    }
    return 1;
  }, []);

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

  const allHeaderRows = useMemo(() => {
    const row = renderHeaderRows(props.headers, headerDepth, 0);
    const children = props.headers
      .filter((h) => h.children && h.children.length > 0)
      .map((h) => h.children!)
      .flat();
    if (children.length > 0) {
      return [row, ...renderAllHeaderRows(children, headerDepth, 1)];
    }
    return [row];
  }, [props.headers, filterToShow, rowHeights]);

  function renderHeaderRows(
    headers: BaseTableHeader[],
    depth: number,
    currentLevel = 0
  ): React.ReactNode {
    if (headers.length === 0) return null;
    return (
      <tr
        key={`header-row-${currentLevel}`}
        ref={(el) => {
          rowRefs.current[currentLevel] = el;
        }}
        style={{ zIndex: 100 - currentLevel }}
      >
        {headers.map((header, index) => {
          const colSpan = getColSpan(header);
          const hasChildren = header.children && header.children.length > 0;
          const rowSpan = hasChildren ? 1 : depth - currentLevel;

          const topOffset = rowHeights
            .slice(0, currentLevel)
            .reduce((a, b) => a + b, 0);

          return (
            <TableHeader
              header={header}
              colSpan={colSpan}
              rowSpan={rowSpan}
              index={index}
              showFilter={filterToShow === header.id}
              onShowFilter={showFilterHandler}
              style={{
                position: "sticky",
                top: `${topOffset}px`,
              }}
            />
          );
        })}
      </tr>
    );
  }

  return <thead className="relative">{allHeaderRows}</thead>;
}

