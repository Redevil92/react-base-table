import type BaseTableHeader from "./BaseTableHeaders";
import type CellCoordinate from "./CellCordinate";
import type TableItem from "./TableItem";

export default interface ContextMenu {
  x: number;
  y: number;
  header: BaseTableHeader;

  item?: TableItem;
  cellCoordinate?: CellCoordinate;
}

