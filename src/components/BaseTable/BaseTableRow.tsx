import { memo } from "react";
import type BaseTableHeader from "./models/BaseTableHeaders";
import type CommentData from "./models/CommentData";
import type HighlightCondition from "./models/HighlightCondition";
import type TableItem from "./models/TableItem";

interface TableRowProps {
  item: TableItem;
  index: number;
  groupName?: string;
  leafHeaders: BaseTableHeader[];
  renderIndexCell: (rowIndex: number, item: TableItem) => React.ReactNode;
  getRowHighlightConditions: (row: TableItem) => HighlightCondition[];
  getCellHighlightConditions: (
    rowConditions: HighlightCondition[],
    columnId: string
  ) => React.CSSProperties;
  comments?: CommentData[];
  isGroupLinked?: (groupName: string) => boolean;
  onRowDoubleClick?: (item: TableItem) => void;
  renderBaseTableCell: (
    item: TableItem,
    header: BaseTableHeader,
    rowIndex: number,
    columnIndex: number,
    disabled?: boolean,
    rowStyle?: React.CSSProperties,
    comments?: CommentData[]
  ) => React.ReactNode;
  selectedCell?: { rowIndex: number; columnIndex: number };
  expandedSelection?: { rowIndex: number; columnIndex: number }[];
  noBorder?: boolean;
  contrastRow?: boolean;
}

const TableRow: React.FC<TableRowProps> = memo((props) => {
  const {
    item,
    index,
    groupName,
    leafHeaders,
    renderIndexCell,
    getRowHighlightConditions,
    getCellHighlightConditions,
    comments = [],
    isGroupLinked,
    onRowDoubleClick,
    renderBaseTableCell,
  } = props;

  const highlightConditions = getRowHighlightConditions(item);

  const rowStyle = highlightConditions
    .filter((condition) => !condition.columnId)
    .reduce(
      (acc, condition) => ({
        ...acc,
        ...(condition.style || {}),
      }),
      {}
    );

  // const rowComments = [...comments].filter(
  //   (comment) => comment.columnId === undefined
  // );

  return (
    <tr
      style={rowStyle}
      className={`${onRowDoubleClick ? "cursor-pointer" : ""}`}
      onDoubleClick={() => onRowDoubleClick?.(item)}
      key={`item-${index}`}
    >
      {renderIndexCell(index, item)}
      {leafHeaders.map((header, j) => {
        const cellStyle = getCellHighlightConditions(
          highlightConditions,
          header.id
        );

        const cellComments = comments.filter(
          (comment) => comment.columnId === header.id
        );

        return renderBaseTableCell(
          item,
          header,
          index,
          j,
          groupName ? isGroupLinked?.(groupName) : undefined,
          cellStyle,
          cellComments
        );
      })}
    </tr>
  );
});

export default TableRow;
