import { notUndefined, useVirtualizer } from "@tanstack/react-virtual";
import type { MutableRefObject } from "react";

const CELL_HEIGHT = 20;

const OVERSCAN = 6;

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

  return { virtualRows, before, after };
};
