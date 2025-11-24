import { useMemo, useState } from "react";
import type BaseTableHeader from "../../models/BaseTableHeaders";
import { mdiChevronDown, mdiChevronUp, mdiDrag } from "@mdi/js";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import BaseCheckbox from "../../../BaseCheckbox";
import Icon from "@mdi/react";

const HeaderItem: React.FC<{
  header: BaseTableHeader;
  parentId?: string;
  idx: number;
  depth: number;
  hiddenColumns: string[];
  dropIndicator?: "above" | "below";
  dragInfo?: {
    parentId: string | undefined;
    fromIdx: number;
  };
  setDragInfo: React.Dispatch<
    React.SetStateAction<
      | {
          parentId: string | undefined;
          fromIdx: number;
        }
      | undefined
    >
  >;

  onCheckboxChange: (headerId: string, checked: boolean) => void;
  getAllChildrenIds: (header: BaseTableHeader) => string[];
}> = ({
  header,
  depth,
  idx,
  hiddenColumns,
  dropIndicator,
  dragInfo,
  setDragInfo,
  onCheckboxChange,
  getAllChildrenIds,
}) => {
  // const draggableId = `${parentId ?? "root"}-${header.id}`;
  // const droppableId = `${parentId ?? "root"}-drop-${idx}`;

  const { setNodeRef, listeners, transform, transition } = useSortable({
    id: idx,
    disabled: true,
  });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if this header is currently visible
  const isSelected = !hiddenColumns.includes(header.id);

  const allChildrenIds = useMemo(
    () => getAllChildrenIds(header),
    [header, getAllChildrenIds]
  );

  // const hasChildren = header.children && header.children.length > 0;

  // const isIndeterminate =
  //   hasChildren &&
  //   allChildrenIds.some((id) => !hiddenColumns.includes(id)) &&
  //   allChildrenIds.some((id) => hiddenColumns.includes(id));

  const handleChange = (checked: boolean) => {
    onCheckboxChange(header.id, checked);

    // Also toggle all children when parent is toggled
    if (header.children) {
      allChildrenIds.forEach((childId) => {
        onCheckboxChange(childId, checked);
      });
    }
  };

  const [showChildren, setShowChildren] = useState<boolean>(true);

  return (
    <div
      className="relative"
      ref={setNodeRef}
      {...listeners}
      style={{ marginLeft: `${depth * 20}px`, ...styles }}
    >
      <div className="flex mb-1 justify-start items-end">
        <div className="w-7 pr-1">
          {header.children && (
            <div
              onClick={() => setShowChildren(!showChildren)}
              data-no-dnd="true"
              className="hover:bg-gray-200 rounded-lg flex justify-end items-center cursor-pointer"
            >
              <Icon path={showChildren ? mdiChevronDown : mdiChevronUp} />
              {/* <BaseIcon
                onClick={() => setShowChildren(!showChildren)}
                icon={showChildren ? mdiChevronDown : mdiChevronUp}
              /> */}
            </div>
          )}
        </div>
        <div
          draggable
          className="cursor-grab pr-2"
          onClick={() => setShowChildren(!showChildren)}
        >
          {/* Drop indicator line */}
          <Icon path={mdiDrag} color="lightGrey" size={0.8} />
          {/* <BaseIcon
            small
            onClick={() => setShowChildren(!showChildren)}
            icon={mdiDrag}
            color="var(--disabled-color)"
          /> */}
        </div>
        <div data-no-dnd="true">
          <BaseCheckbox
            checked={isSelected}
            small
            // indeterminate={isIndeterminate}
            onChange={() => handleChange(!isSelected)}
          />
        </div>

        {header.text ? (
          <p className="text-sm ml-2">{header.text || header.id}</p>
        ) : (
          <p className="text-xs ml-2 italic text-gray-400">
            {header.text || header.id}
          </p>
        )}
      </div>

      {dropIndicator &&
        (dropIndicator === "above" ? (
          <div
            className="absolute left-0 right-0 h-0.5 bg-blue-500"
            style={{ top: 0 }}
          ></div>
        ) : (
          <div
            className="absolute left-0 right-0 h-0.5 bg-blue-500"
            style={{ bottom: 0 }}
          ></div>
        ))}

      {header.children && showChildren && (
        <>
          {header.children.map((child, idx) => (
            <HeaderItem
              key={child.id}
              header={child}
              idx={idx}
              parentId={header.id}
              depth={depth + 1}
              hiddenColumns={hiddenColumns}
              onCheckboxChange={onCheckboxChange}
              getAllChildrenIds={getAllChildrenIds}
              dragInfo={dragInfo}
              setDragInfo={setDragInfo}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default HeaderItem;
