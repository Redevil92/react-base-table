import { ReactNode } from "react";
import TableItem from "./TableItem";

export enum TableHeaderType {
  STRING = "string",
  LIST = "list",
  NUMBER = "number",
}

export default interface BaseTableHeader {
  id: string;
  text: string;
  hasFilter?: boolean;
  width?: number; // to implement
  children?: BaseTableHeader[]; // to implement
  editOptions?: {
    editable?: boolean;
    required?: boolean;
    type: TableHeaderType;
    options?: string[];
    defaultValue?: string | number;
  }; // to implement
  sortable?: boolean;
  align?: "left" | "center" | "right";
  customSort?: (a: TableItem, b: TableItem, ascendingOrder: boolean) => number;
  customHeader?: (header: BaseTableHeader) => ReactNode;
  customRender?: (item: TableItem, header: BaseTableHeader) => ReactNode;
}
