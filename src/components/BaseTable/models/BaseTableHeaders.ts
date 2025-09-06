import { type ReactNode } from "react";
import type TableItem from "./TableItem";

export const TableHeaderType = {
  STRING: "string",
  LIST: "list",
  NUMBER: "number",
} as const;

export type TableHeaderType =
  (typeof TableHeaderType)[keyof typeof TableHeaderType];

export default interface BaseTableHeader {
  id: string;
  text: string;
  hasFilter?: boolean;
  width?: number;
  children?: BaseTableHeader[];
  editOptions?: {
    editable?: boolean;
    isDisabled?: (item: TableItem) => boolean;
    greyedOutIfNotEditable?: boolean;
    required?: boolean;
    type: TableHeaderType;
    options?: string[];
    defaultValue?: string | number;
    canAddNewOption?: boolean;
  };
  sortable?: boolean;
  align?: "left" | "center" | "right";
  customSort?: (a: TableItem, b: TableItem, ascendingOrder: boolean) => number;
  customHeader?: (header: BaseTableHeader) => ReactNode;
  customRender?: (item: TableItem, header: BaseTableHeader) => ReactNode;
}
