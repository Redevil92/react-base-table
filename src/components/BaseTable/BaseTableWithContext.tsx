import BaseTable, { type BaseTableProps } from "./BaseTable";
import { CommentPopupProvider } from "./contexts/useCommentPopupContext";
import type TableItem from "./models/TableItem";

export default function BaseTableWithContext<T extends TableItem>(
  props: Readonly<BaseTableProps<T>>
) {
  return (
    <>
      <CommentPopupProvider>
        <BaseTable {...props}></BaseTable>
      </CommentPopupProvider>
    </>
  );
}
