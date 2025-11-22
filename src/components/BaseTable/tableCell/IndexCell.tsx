import { memo, useMemo } from "react";

import Icon from "@mdi/react";
import { mdiDrag } from "@mdi/js";
import { useTableInteractionContext } from "../contexts/useTableInteractionContext";
import type TableItem from "../models/TableItem";
import {
  useAdvancedSettings,
  useGroupBy,
  useProcessedItems,
  useTableItems,
} from "../../../stores/tableDataStore";

interface IndexCellProps {
  item: TableItem;
  rowIndex: number;
  rowSpan: number;
}

const IndexCell: React.FC<IndexCellProps> = memo((props) => {
  const advancedSettings = useAdvancedSettings();
  const groupBy = useGroupBy();
  const processedItems = useProcessedItems();
  const items = useTableItems();

  const {
    draggedRowIndex,
    dropTargetIndex,
    handleDragEnd,
    handleRowDragStart,
    handleDrop,
    handleRowDragOver,
  } = useTableInteractionContext();

  const originalIndexMap = useMemo(() => {
    const map = new Map();
    items.forEach((item, index) => {
      map.set(item, index + 1);
    });
    return map;
  }, [items]);

  const isDropTarget = useMemo(
    () => dropTargetIndex === props.rowIndex,
    [dropTargetIndex, props.rowIndex]
  );
  const dropFromAbove = useMemo(
    () => draggedRowIndex !== null && draggedRowIndex < props.rowIndex,
    [draggedRowIndex, props.rowIndex]
  );

  return (
    <td
      rowSpan={props.rowSpan}
      style={{ alignContent: "start" }}
      className={`text-right pr-2 bg-gray-100 font-medium relative ${
        advancedSettings?.enableRowDragDrop ? "cursor-grab" : ""
      }`}
      draggable={advancedSettings?.enableRowDragDrop}
      onDragEnd={
        advancedSettings?.enableRowDragDrop ? handleDragEnd : undefined
      }
      onDragStart={
        advancedSettings?.enableRowDragDrop
          ? () => handleRowDragStart(props.rowIndex, props.item)
          : undefined
      }
      onDrop={
        advancedSettings?.enableRowDragDrop
          ? () => handleDrop(props.item)
          : undefined
      }
      onDragOver={
        advancedSettings?.enableRowDragDrop
          ? (e) => {
              e.preventDefault(); // Allow dropping
              handleRowDragOver(props.rowIndex);
            }
          : undefined
      }
      onDragEnter={
        advancedSettings?.enableRowDragDrop
          ? (e) => {
              e.preventDefault();
              handleRowDragOver(props.rowIndex);
            }
          : undefined
      }
    >
      {isDropTarget && (
        <div
          style={{
            position: "absolute",
            top: dropFromAbove ? "100%" : 0,
            left: 0,
            width: "100vw", // Extend across the entire viewport width
            height: "2px",
            backgroundColor: "rgb(59, 130, 246)",
            zIndex: 10,
          }}
        />
      )}
      <div className="flex grow items-center justify-between">
        {advancedSettings?.enableRowDragDrop && (
          <Icon path={mdiDrag} color={"grey"} size={0.8} />
        )}
        {groupBy
          ? advancedSettings?.indexUseOriginalOrder
            ? originalIndexMap.get(processedItems[props.rowIndex])
            : props.rowIndex + 1
          : originalIndexMap.get(props.item)}
      </div>
    </td>
  );
});

export default IndexCell;
