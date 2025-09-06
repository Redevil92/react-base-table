import type GroupInfo from "./GroupInfo";
import type TableItem from "./TableItem";

export default interface ItemWithGroupInfo extends GroupInfo {
  isGroup: false;
  rowIndex: number;
  item: TableItem;
}
