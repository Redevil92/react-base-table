import type { CSSProperties } from "react";
import type HighlightCondition from "../models/HighlightCondition";
import type TableItem from "../models/TableItem";

export const getCellHighlightConditions = (
  rowConditions: HighlightCondition[],
  columnId: string
): CSSProperties => {
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
};

export const getRowHighlightConditions = (
  row: TableItem,
  highlightConditions: HighlightCondition[]
): HighlightCondition[] => {
  const conditions = highlightConditions.filter(
    (condition) => row[condition.propertyId] === condition.value
  );
  return conditions || [];
};

