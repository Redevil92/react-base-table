import { memo, useMemo } from "react";
import type TableItem from "./models/TableItem";
import BaseTableCell from "./tableCell/BaseTableCell";
import { useTableInteractionContext } from "./contexts/useTableInteractionContext";
import {
  useAdvancedSettings,
  useComments,
  useGroupBy,
  useHighlightConditions,
  useProcessedLeafHeaders,
} from "../../stores/tableDataStore";
import {
  getCellHighlightConditions,
  getRowHighlightConditions,
} from "./tableFunctions/highlightCondition";
import IndexCell from "./tableCell/IndexCell";

interface TableRowProps {
  item: TableItem;
  index: number;
  groupName?: string;
  isGroupLinked?: (groupName: string) => boolean;
  ref: React.Ref<HTMLTableRowElement>;
  dataIndex: number;
}

const TableRow: React.FC<TableRowProps> = memo((props) => {
  const advancedSettings = useAdvancedSettings();
  const processedLeafHeaders = useProcessedLeafHeaders();
  const groupBy = useGroupBy();
  const comments = useComments();
  const highlightConditions = useHighlightConditions();

  const { draggedRowIndex, dropTargetIndex, onRowDoubleClick } =
    useTableInteractionContext();

  // const cellCommentMap = useMemo(() => {
  //   const map = new Map();
  //   comments.forEach((comment) => {
  //     const key = `${comment.columnId}-${comment.propertyId}-${comment.value}`;
  //     if (!map.has(key)) map.set(key, []);
  //     map.get(key).push(comment);
  //   });
  //   return map;
  // }, [comments]);

  const rowHighlightConditions = useMemo(() => {
    return getRowHighlightConditions(props.item, highlightConditions);
  }, [highlightConditions, props.item]);

  const rowStyle = useMemo(() => {
    return {
      ...rowHighlightConditions
        .filter((condition) => !condition.columnId)
        .reduce(
          (acc, condition) => ({ ...acc, ...(condition.style || {}) }),
          {}
        ),

      opacity: draggedRowIndex === props.index ? 0.5 : 1,
      backgroundColor:
        dropTargetIndex === props.index ? "rgba(59, 130, 246, 0.1)" : undefined,
      position: "relative" as "relative",
    };
  }, [rowHighlightConditions, draggedRowIndex, dropTargetIndex, props.index]);

  let rowSpan = 0;

  const fromArrayColumn = processedLeafHeaders.filter((h) => h.fromArray);

  if (fromArrayColumn.length > 0) {
    processedLeafHeaders.forEach((header) => {
      if (header.fromArray && Array.isArray(props.item[header.fromArray])) {
        rowSpan = Math.max(
          rowSpan,
          (props.item[header.fromArray] as unknown as any[]).length
        );
      }
    });
    rowSpan++;
  }

  const mainRowCells = useMemo(() => {
    return processedLeafHeaders.map((header, j) => {
      const cellStyle = getCellHighlightConditions(
        rowHighlightConditions,
        header.id
      );

      const cellComments = comments.filter(
        (comment) =>
          comment.columnId === header.id &&
          props.item[comment.propertyId] === comment.value
      );

      return (
        <BaseTableCell
          isInLinkedGroup={
            (props.groupName && props.isGroupLinked
              ? props.isGroupLinked(props.groupName)
              : undefined) || false
          }
          key={`item-${props.index}-${j}-${header.id}`}
          header={header}
          item={props.item}
          style={cellStyle}
          rowIndex={props.index}
          columnIndex={j}
          comments={cellComments}
          rowSpan={header.fromArray ? 1 : Math.max(rowSpan, 1)}
        />
      );
    });
  }, [
    processedLeafHeaders,
    props.index,
    props.item,
    props.groupName,
    props.isGroupLinked,
    rowHighlightConditions,
    comments,
    rowSpan,
  ]);

  const rowId = useMemo(() => {
    return advancedSettings?.rowIdProperty
      ? String(props.item[advancedSettings.rowIdProperty])
      : undefined;
  }, [props.item]);

  const arrayRows = useMemo(() => {
    if (fromArrayColumn.length === 0 || rowSpan <= 1) return null;

    return Array.from({ length: rowSpan - 1 }).map((_, rowIdx) => {
      return (
        <tr key={`item-array-${props.index}-${rowIdx}`}>
          {fromArrayColumn.map((header, j) => {
            const originalColumnIndex = processedLeafHeaders.findIndex(
              (h) => h.id === header.id
            );

            return (
              <BaseTableCell
                isInLinkedGroup={
                  (props.groupName && props.isGroupLinked
                    ? props.isGroupLinked(props.groupName)
                    : undefined) || false
                }
                key={`item-${props.index}-${j}`}
                header={header}
                item={props.item}
                style={{}}
                rowIndex={props.index}
                columnIndex={originalColumnIndex}
                comments={[]}
                rowSpan={header.fromArray ? 1 : rowSpan}
                fromArrayData={{
                  fromArray: header.fromArray!,
                  index: rowIdx,
                }}
              />
            );
          })}
        </tr>
      );
    });
  }, [
    fromArrayColumn,
    props.index,
    props.item,
    props.groupName,
    props.isGroupLinked,
    rowSpan,
  ]);

  return (
    <>
      <tr
        id={rowId}
        style={rowStyle}
        // data-index={props.index}
        className={`${onRowDoubleClick ? "cursor-pointer" : ""}`}
        onDoubleClick={
          onRowDoubleClick ? () => onRowDoubleClick(props.item) : undefined
        }
        key={`item-${groupBy ? props.item.groupName : ""}-${props.index}`}
        ref={props.ref}
        data-index={props.dataIndex}
      >
        {advancedSettings?.showIndex && (
          <IndexCell
            item={props.item}
            rowIndex={props.index}
            rowSpan={Math.max(rowSpan, 1)}
          />
        )}

        {mainRowCells}
      </tr>
      {arrayRows}
    </>
  );
});

export default TableRow;

