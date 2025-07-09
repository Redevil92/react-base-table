import BaseTableHeader from "./models/BaseTableHeaders";
import TableItem from "./models/TableItem";

interface CustomRenderItemProps {
  item: TableItem;
  header: BaseTableHeader;
}

export default function CustomRenderItem(
  props: Readonly<CustomRenderItemProps>
) {
  return <>{props.header.customRender!(props.item, props.header)}</>;
}
