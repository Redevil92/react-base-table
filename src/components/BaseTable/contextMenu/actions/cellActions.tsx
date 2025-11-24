import { mdiCommentPlus, mdiFormatColorFill, mdiCloseThick } from "@mdi/js";
import type TableItem from "../../models/TableItem";
import type CellCoordinate from "../../models/CellCordinate";
import type ContextMenuAction from "../../models/ContextMenuAction";
import ColorPicker from "../../../ColorPicker";
import BaseButton from "../../../BaseButton";
import { useCommentPopupActions } from "../../../../stores/commentPopupStore";
import {
  useComments,
  useHighlightConditions,
} from "../../../../stores/tableDataStore";

export function useCellActions() {
  const comments = useComments();
  const highlightCondition = useHighlightConditions();
  const { setOpenCommentCell } = useCommentPopupActions();

  const getCellActions = (
    item: TableItem,
    headerId: string,
    setHighlightCondition: any,
    removeHighlightCondition: any,
    onClose: () => void
  ): ContextMenuAction[] => {
    const commentsForCell =
      comments.filter(
        (condition) =>
          item[condition.propertyId] === condition.value &&
          condition.columnId === headerId
      ) || [];

    const backgroundColorCondition = highlightCondition?.find((condition) => {
      return (
        item[condition.propertyId] === condition.value &&
        condition.columnId === headerId &&
        condition.style.backgroundColor
      );
    });

    const backgroundColor = backgroundColorCondition?.style.backgroundColor;

    return [
      {
        icon: mdiCommentPlus,
        iconColor: "#5588b4",
        text: `${commentsForCell.length > 0 ? "Edit" : "Add"} a comment`,
        onClick: (
          _event: React.MouseEvent,
          _item?: TableItem,
          coordinates?: CellCoordinate
        ) => {
          console.log(coordinates);
          if (coordinates) {
            console.log("Opening comment cell at:", coordinates);
            setOpenCommentCell(coordinates);
          }
        },
      },
      {
        icon: mdiFormatColorFill,
        iconColor: "#299b42",
        text: `Set cell color`,
        customRender: () => (
          <>
            <ColorPicker
              initialColor={backgroundColor}
              onColorChange={(color) =>
                setHighlightCondition(item, headerId, {
                  backgroundColor: color,
                })
              }
              onClose={onClose}
            />
            {backgroundColor && (
              <BaseButton
                circle
                small
                icon={mdiCloseThick}
                iconSize={0.6}
                iconColor="var(--error-color)"
                className="h-5 min-h-5"
                onClick={() =>
                  removeHighlightCondition(item, headerId, "backgroundColor")
                }
              ></BaseButton>
            )}
          </>
        ),
        onClick: () => {},
      },
    ];
  };

  return { getCellActions };
}
