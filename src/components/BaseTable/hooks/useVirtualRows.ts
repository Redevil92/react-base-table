import { notUndefined, useVirtualizer } from "@tanstack/react-virtual";
import type { MutableRefObject } from "react";

const CELL_HEIGHT = 25;

const OVERSCAN = 40;
const SCROLL_MARGIN = 20;
// Add margin to prevent boundary flickering

export type Props = {
  rowsCount: number;
  scrollRef: MutableRefObject<HTMLElement | null>;
};

export const useVirtualRows = ({ rowsCount, scrollRef }: Props) => {
  const virtualizer = useVirtualizer({
    count: rowsCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CELL_HEIGHT,
    overscan: OVERSCAN,
    scrollMargin: SCROLL_MARGIN,
    lanes: 1,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => {
            return element?.getBoundingClientRect().height;
          }
        : undefined,
  });

  // This will replace "real" rows for rendering
  const virtualRows = virtualizer.getVirtualItems();

  const [before, after] =
    virtualRows.length > 0
      ? [
          notUndefined(virtualRows[0]).start - virtualizer.options.scrollMargin,
          virtualizer.getTotalSize() -
            notUndefined(virtualRows[virtualRows.length - 1]).end,
        ]
      : [0, 0];

  return { virtualizer, virtualRows, before, after };
};

