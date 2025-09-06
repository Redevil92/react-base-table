import type CellCoordinate from "./CellCordinate";
import type TableItem from "./TableItem";

export default interface ContextMenuAction {
  icon?: string;
  iconColor?: string;
  text: string;
  onClick: (item: TableItem, itemCoordinates: CellCoordinate) => void;
  groupName?: string;
  disabled?: boolean;
  subActions?: ContextMenuAction[];
  customRender?: () => React.ReactNode;
}
