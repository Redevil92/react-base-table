import { ReactNode } from "react";
import TableItem from "./TableItem";

export enum TableHeaderType {
  STRING = "string",
  // LIST = "list",
  NUMBER = "number",
}

export default interface BaseTableHeader {
  id: string;
  text: string;
  type?: TableHeaderType;
  hasFilter?: boolean;
  width?: number; // to implement
  children?: BaseTableHeader[]; // to implement
  customHeader?: (header: BaseTableHeader) => ReactNode;
  customRender?: (item: TableItem, header: BaseTableHeader) => ReactNode;
  editable?: boolean; // to implement
  sortable?: boolean;
  customSort?: (a: TableItem, b: TableItem, ascendingOrder: boolean) => number;
}
