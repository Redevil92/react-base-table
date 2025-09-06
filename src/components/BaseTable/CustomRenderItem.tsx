import type BaseTableHeader from "./models/BaseTableHeaders";
import type TableItem from "./models/TableItem";

interface CustomRenderItemProps {
  item: TableItem;
  header: BaseTableHeader;
}

export default function CustomRenderItem(
  props: Readonly<CustomRenderItemProps>
) {
  return <>{props.header.customRender!(props.item, props.header)}</>;
}
