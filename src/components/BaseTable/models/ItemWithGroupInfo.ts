import GroupInfo from "./GroupInfo";
import TableItem from "./TableItem";

export default interface ItemWithGroupInfo extends GroupInfo {
  isGroup: false;
  rowIndex: number;
  item: TableItem;
}
