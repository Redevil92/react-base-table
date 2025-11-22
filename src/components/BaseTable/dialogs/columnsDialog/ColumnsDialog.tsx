import { useState, useCallback, useMemo, useEffect } from "react";
import type BaseTableHeader from "../../models/BaseTableHeaders";

import { mdiUndo } from "@mdi/js";
import HeaderItem from "./HeaderItem";
import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import {
  useHiddenHeadersId,
  useTableDataActions,
  useTableHeaders,
} from "../../../../stores/tableDataStore";
import BaseButton from "../../../BaseButton";

const ColumnsDialog: React.FC = () => {
  const headers = useTableHeaders();
  const [reorderedHeaders, setReorderedHeaders] = useState<BaseTableHeader[]>(
    []
  );

  const [dragInfo, setDragInfo] = useState<{
    parentId: string | undefined;
    fromIdx: number;
  }>();

  useEffect(() => {
    setReorderedHeaders(headers);
  }, [headers]);

  //const hiddenColumnsId = useHiddenHeadersId();
  const tableDataActions = useTableDataActions();

  const hiddenHeadersId = useHiddenHeadersId();
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(hiddenHeadersId);

  useEffect(() => {
    setHiddenColumns(hiddenHeadersId);
  }, [hiddenHeadersId]);

  // Helper function to get all child IDs (and grandchildren, etc.) for a header
  const getAllChildrenIds = useCallback((header: BaseTableHeader): string[] => {
    if (!header.children || header.children.length === 0) {
      return [];
    }

    return header.children.reduce((ids: string[], child) => {
      return [...ids, child.id, ...getAllChildrenIds(child)];
    }, []);
  }, []);

  // Helper to get parent ID for a header
  const getParentMap = useMemo(() => {
    const map = new Map<string, string>();

    const processHeader = (header: BaseTableHeader) => {
      if (header.children) {
        header.children.forEach((child) => {
          map.set(child.id, header.id);
          processHeader(child);
        });
      }
    };

    headers.forEach((header) => processHeader(header));
    return map;
  }, [headers]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback(
    (headerId: string, checked: boolean) => {
      setHiddenColumns((prev) => {
        // Start with previous state
        let newHiddenColumns = [...prev];

        if (checked) {
          // If checked, remove from hidden columns
          newHiddenColumns = newHiddenColumns.filter((id) => id !== headerId);

          // When a child is checked, ensure its parents are also checked
          let parentId = getParentMap.get(headerId);
          while (parentId) {
            newHiddenColumns = newHiddenColumns.filter((id) => id !== parentId);
            parentId = getParentMap.get(parentId);
          }
        } else {
          // If unchecked, add to hidden columns
          if (!newHiddenColumns.includes(headerId)) {
            newHiddenColumns.push(headerId);
          }

          // Auto uncheck parents if all siblings are unchecked
          const checkAndUpdateParent = (childId: string) => {
            const parentId = getParentMap.get(childId);
            if (!parentId) return;

            // Find all children of this parent
            const siblings: string[] = [];
            headers.forEach((header) => {
              if (header.id === parentId && header.children) {
                siblings.push(...header.children.map((child) => child.id));
              } else if (header.children) {
                header.children.forEach((child) => {
                  if (child.id === parentId && child.children) {
                    siblings.push(
                      ...child.children.map((grandchild) => grandchild.id)
                    );
                  }
                });
              }
            });

            // Check if all siblings are hidden
            const allSiblingsHidden = siblings.every((siblingId) =>
              newHiddenColumns.includes(siblingId)
            );

            // If all siblings are hidden, hide the parent too
            if (allSiblingsHidden && !newHiddenColumns.includes(parentId)) {
              newHiddenColumns.push(parentId);
              checkAndUpdateParent(parentId);
            }
          };

          checkAndUpdateParent(headerId);
        }
        tableDataActions.setHiddenHeadersId(newHiddenColumns);
        return newHiddenColumns;
      });
    },
    [getParentMap, headers]
  );

  // Reset to show all columns
  const handleReset = () => {
    tableDataActions.setHiddenHeadersId([]);
    setHiddenColumns([]);
  };

  const [overId, setOverId] = useState<string>();
  const [dropLinePosition, setDropLinePosition] = useState<"above" | "below">();

  const dragEndEvent = (event: DragEndEvent) => {
    const { over, active } = event;
    setReorderedHeaders((items) => {
      const activeIdx = items.findIndex((item) => item.id === active.id);
      const overIdx = items.findIndex((item) => item.id === over?.id);

      // If indices are invalid, return previous state (must always return an array)
      if (activeIdx === -1 || overIdx === -1) {
        return items;
      }

      // Perform a pure, always-returning array move
      const next = [...items];
      const [moved] = next.splice(activeIdx, 1);
      next.splice(overIdx, 0, moved);
      return next;
    });

    setOverId(undefined);
  };
  const dragMoveFn = (_event: DragMoveEvent) => {};

  const dragStartEvent = (event: DragMoveEvent) => {
    console.log("drag started:", event);
  };

  const dragOverEvent = (event: DragMoveEvent) => {
    const { active, over } = event;

    const overIndx = over?.id;
    const activeIndx = active.id.toString();

    const overId = reorderedHeaders.find(
      (_header, index) => index === overIndx
    )?.id;

    setOverId(overId);

    if (overIndx === undefined) return;

    if (activeIndx > overIndx) setDropLinePosition("above");
    else setDropLinePosition("below");
  };

  return (
    <div>
      <BaseButton
        text="Reset selection"
        small
        icon={mdiUndo}
        onClick={handleReset}
      ></BaseButton>
      <div className=" rounded  mt-4 max-h-[400px] overflow-y-auto">
        <DndContext
          onDragStart={dragStartEvent}
          onDragEnd={dragEndEvent}
          onDragMove={dragMoveFn}
          onDragOver={dragOverEvent}
        >
          <SortableContext items={reorderedHeaders}>
            {reorderedHeaders.map((header, idx) => (
              <HeaderItem
                key={header.id}
                parentId={undefined}
                idx={idx}
                header={header}
                depth={0}
                hiddenColumns={hiddenColumns}
                onCheckboxChange={handleCheckboxChange}
                getAllChildrenIds={getAllChildrenIds}
                dragInfo={dragInfo}
                setDragInfo={setDragInfo}
                dropIndicator={
                  overId === header.id ? dropLinePosition : undefined
                }
              />
            ))}
          </SortableContext>
          {/* {reorderedHeaders.map((header, idx) => (
            <HeaderItem
              key={header.id}
              parentId={undefined}
              idx={idx}
              header={header}
              depth={0}
              hiddenColumns={hiddenColumns}
              onCheckboxChange={handleCheckboxChange}
              getAllChildrenIds={getAllChildrenIds}
              dragInfo={dragInfo}
              setDragInfo={setDragInfo}
            />
          ))} */}
        </DndContext>
      </div>
    </div>
  );
};

export default ColumnsDialog;
