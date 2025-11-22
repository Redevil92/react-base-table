import {
  type CSSProperties,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./BaseTableCell.css";
import CustomRenderItem from "../CustomRenderItem";
import type TableItem from "../models/TableItem";
import type CommentData from "../models/CommentData";
import CommentPopup from "../CommentPopup";
import type BaseTableHeader from "../models/BaseTableHeaders";
import { TableHeaderType } from "../models/BaseTableHeaders";
import ListCell from "./cellImplementation/ListCell";
import NumberCell from "./cellImplementation/NumberCell";
import { useTableInteractionContext } from "../contexts/useTableInteractionContext";
import type CellCoordinate from "../models/CellCordinate";
import { formatNumber } from "./cellImplementation/formatNumberFunctions";

import notApplicableBg from "./notApplicableBackground.png";
import {
  useAdvancedSettings,
  useProcessedLeafHeaders,
} from "../../../stores/tableDataStore";
import {
  useCommentPopupActions,
  useOpenCommentCell,
} from "../../../stores/commentPopupStore";
import { useContextMenuActions } from "../../../stores/contextMenuStore";
import { useTableSelectionStore } from "../../../stores/tableSelectionStore";
import { getCellId } from "../../../utils/cellIdCreation";

export interface BaseTableCellProps {
  header: BaseTableHeader;
  item: TableItem;
  rowIndex: number;
  columnIndex: number;
  rowSpan?: number;
  comments?: CommentData[];
  style?: CSSProperties;
  fromArrayData?: {
    fromArray: string;
    index: number;
  };
  isInLinkedGroup: boolean;
}

const BaseTableCell: React.FC<BaseTableCellProps> = memo((props) => {
  const {
    onCellBlur,
    onCellEnter,

    handleCellKeyDown,
    onCellMouseDown,
    onCellMouseEnter,
    saveCommentHandler,
    deleteCommentHandler,
    onRightClick,
  } = useTableInteractionContext();

  const cellValue = useMemo(() => {
    if (props.fromArrayData) {
      return (props.item[props.header.fromArray!] as any[])[
        props.fromArrayData.index
      ][props.header.id] as string | number | undefined;
    }

    return props.item[props.header.id] as string | number | undefined;
  }, [props.item, props.header, props.fromArrayData]);

  const getDefaultValue = () => {
    return cellValue;
  };

  const [editValue, setEditValue] = useState<string | number | undefined>(
    () => {
      return getDefaultValue();
    }
  );

  const valueToSave = useMemo(() => {
    if (props.header.editOptions?.type === TableHeaderType.NUMBER) {
      if (!isNaN(Number(editValue))) {
        return Number(editValue);
      }
    }

    return editValue;
  }, [editValue]);

  const processedLeafHeaders = useProcessedLeafHeaders();
  const openCommentCell = useOpenCommentCell();
  const { setOpenCommentCell } = useCommentPopupActions();
  const advancedSettings = useAdvancedSettings();
  const { setContextMenu } = useContextMenuActions();

  const cellCoordinate: CellCoordinate = useMemo(() => {
    return {
      rowIndex: props.rowIndex,
      columnIndex: props.columnIndex,
      fromArrayData: props.fromArrayData,
    };
  }, [props.rowIndex, props.columnIndex, props.fromArrayData]);

  useEffect(() => {
    setEditValue(getDefaultValue());
  }, [props.item, props.header.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    let newValue: string | number | undefined = target.value;

    // Convert based on input element type
    if (target instanceof HTMLInputElement) {
      switch (target.type) {
        case "number":
          newValue = target.value === "" ? undefined : Number(target.value);
          // Check for NaN
          if (typeof newValue === "number" && isNaN(newValue)) {
            newValue = undefined;
          }
          break;

        // case "checkbox":
        //   newValue = target.checked;
        //   break;

        case "date":
          // Keep as string but could convert to Date if needed
          newValue = target.value;
          break;

        default:
          // Text, email, tel, etc. - keep as string
          newValue = target.value;
      }
    } else if (target instanceof HTMLSelectElement) {
      // Handle select elements - keep as string
      newValue = target.value;
    }

    setEditValue(newValue);
  };

  const handleBlur = async () => {
    console.log("Blurred with value:", editValue);
    await onCellBlur(valueToSave, props.item, props.header, {
      rowIndex: props.rowIndex,
      columnIndex: props.columnIndex,
      fromArrayData: props.fromArrayData,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLTableCellElement>) => {
    if (
      openCommentCell?.columnIndex !== props.columnIndex ||
      openCommentCell.rowIndex !== props.rowIndex
    ) {
      setOpenCommentCell(undefined); // Close comment popup on cell click
    }
    onCellMouseDown(e, {
      rowIndex: props.rowIndex,
      columnIndex: props.columnIndex,
      fromArrayData: props.fromArrayData,
    });
  };

  const onKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onCellEnter(valueToSave, props.item, props.header, {
        rowIndex: props.rowIndex,
        columnIndex: props.columnIndex,
        fromArrayData: props.fromArrayData,
      });
    } else if (e.key === "Escape") {
      setEditValue(getDefaultValue()); // Reset to original value on Escape
    } else if (
      isInEditingMode() &&
      ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key) &&
      !e.shiftKey // We are expanding the selection with Shift + Arrow keys
    ) {
      return;
    } else if (e.ctrlKey && (e.key === "z" || e.key === "y")) {
      e.preventDefault();
    } else {
      if (["ArrowDown", "ArrowUp", "Tab"].includes(e.key)) {
        //handleBlur();
      }
      handleCellKeyDown(e);
    }
  };

  const isInEditingMode = () => {
    return (
      (document.activeElement === inputRef.current ||
        document.activeElement === selectRef.current) &&
      isEditable
    );
  };

  const isCommentPopupOpen = useMemo(
    () =>
      openCommentCell?.columnIndex === props.columnIndex &&
      openCommentCell.rowIndex === props.rowIndex &&
      openCommentCell.fromArrayData?.fromArray ===
        props.fromArrayData?.fromArray &&
      openCommentCell.fromArrayData?.index === props.fromArrayData?.index,
    [openCommentCell, props.columnIndex, props.rowIndex]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const isSelected = useTableSelectionStore(
    (state) =>
      state.selectedCell?.rowIndex === props.rowIndex &&
      state.selectedCell?.columnIndex === props.columnIndex &&
      state.selectedCell?.fromArrayData?.index === props.fromArrayData?.index
  );

  const isInExpandedSelection = useTableSelectionStore(
    (state) =>
      state.expandedSelection?.some(
        (cell) =>
          cell.rowIndex === props.rowIndex &&
          cell.columnIndex === props.columnIndex &&
          cell.fromArrayData?.index === props.fromArrayData?.index
      ) || false
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", // 8px padding
    // height: cellSize.height ? `${cellSize.height - 10}px` : "calc(100% - 8px)", // 8px padding
    // boxSizing: "border-box" as React.CSSProperties["boxSizing"],
    outline: "none",
    border: "none",
    background: "transparent",
  };

  const isNotApplicable = useMemo(() => {
    return props.header.editOptions?.notApplicable?.(
      props.item,
      props.fromArrayData
    );
  }, [
    props.header.editOptions?.notApplicable,
    props.item,
    props.fromArrayData,
  ]);

  const isEditable = useMemo(() => {
    return (
      props.header.editOptions?.editable &&
      !props.isInLinkedGroup &&
      !props.header.editOptions.isDisabled?.(props.item, props.fromArrayData) &&
      !isNotApplicable
    );
  }, [
    props.header.editOptions?.editable,
    props.isInLinkedGroup,
    props.header.editOptions?.isDisabled,
    isNotApplicable,
    props.item,
    props.fromArrayData,
  ]);

  const determineStyle = useMemo((): React.CSSProperties => {
    // Don't create a new object on every render
    const baseStyle = props.style || {};

    if (isNotApplicable) {
      return {
        ...baseStyle,
        // baclground as oblique dashes pattern
        backgroundImage: `url(${notApplicableBg})`,
        backgroundRepeat: "repeat",
        // backgroundSize: "auto",
        backgroundSize: "22px 22px",
        // backgroundImage:
        //   "repeating-linear-gradient(-45deg, transparent 0px 5px, black 6px 6px)",
      };
    }

    const isDisabled =
      props.isInLinkedGroup ||
      (!isEditable && props.header.editOptions?.greyedOutIfNotEditable);

    // 2. Apply selection styles (highest priority)
    let defaultBgColor = baseStyle.backgroundColor;

    let colorToApply;

    if (isInExpandedSelection && !isSelected) {
      colorToApply = "rgba(191, 219, 254, 0.5)"; // bg-blue-200/50
    }

    if (isDisabled) {
      defaultBgColor = baseStyle.backgroundColor || "rgba(229, 231, 235, 0.5)";
    }

    if (
      props.rowIndex % 2 !== 0 &&
      advancedSettings?.contrastRow &&
      !baseStyle.backgroundColor
    ) {
      defaultBgColor = defaultBgColor || "rgba(239, 246, 255, 0.5)"; // bg-blue-50/50
    }

    if (colorToApply && defaultBgColor) {
      return {
        ...baseStyle,
        background: `
      linear-gradient(${colorToApply}, ${colorToApply}),
      linear-gradient(${defaultBgColor}, ${defaultBgColor})
    `,
      }; // needed
    }

    return {
      ...baseStyle,
      background: defaultBgColor || colorToApply,
      textAlign: props.header.align,
      maxWidth: props.header.width ? `${props.header.width}px` : "none",
    };
  }, [
    props.style,
    props.isInLinkedGroup,
    props.header.editOptions?.editable,
    props.header.editOptions?.greyedOutIfNotEditable,
    props.rowIndex,
    advancedSettings?.contrastRow,
    isInExpandedSelection,
    isSelected,
    props.header.align,
    props.header.width,
  ]);

  const cellContent = useMemo(() => {
    if (isNotApplicable) {
      return <div></div>;
    }

    if (isEditable && isSelected) {
      switch (props.header.editOptions!.type) {
        case TableHeaderType.NUMBER:
          return (
            <NumberCell
              id={getCellId(
                props.rowIndex,
                props.columnIndex,
                props.fromArrayData
              )}
              inputRef={inputRef}
              initialValue={
                editValue !== undefined ? String(editValue) : undefined
              }
              cellValue={cellValue}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          );
        case TableHeaderType.LIST:
          return (
            <ListCell
              inputRef={inputRef}
              header={props.header}
              value={editValue as string}
              options={props.header.editOptions!.options || []}
              onEnter={(value) => {
                setEditValue(value);
                onCellEnter(value, props.item, props.header, {
                  rowIndex: props.rowIndex,
                  columnIndex: props.columnIndex,
                  fromArrayData: props.fromArrayData,
                });
              }}
              onSelect={(value) => {
                setEditValue(value);
                onCellBlur(value, props.item, props.header, {
                  rowIndex: props.rowIndex,
                  columnIndex: props.columnIndex,
                  fromArrayData: props.fromArrayData,
                });
              }}
            />
          );

        default:
          return (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={editValue as string}
                onChange={handleChange}
                // onBlur={handleBlur}
                autoFocus
                style={inputStyle}
              />
            </div>
          );
      }
    } else {
      // For non-editable or non-selected cells
      if (props.header.customRender) {
        return (
          <CustomRenderItem
            item={props.item}
            header={props.header}
            fromArrayData={props.fromArrayData}
          />
        );
      } else {
        let valueToDisplay = cellValue;

        // if cellValue is a number format it with fixed decimal places
        if (typeof cellValue === "number") {
          valueToDisplay = formatNumber(cellValue);
        }

        return (
          <div className="flex justify-between">
            <span
              className="truncate whitespace-nowrap overflow-ellipsis"
              title={String(valueToDisplay)}
            >
              {valueToDisplay}
            </span>
            {props.header.editOptions?.type === TableHeaderType.LIST && (
              <div
                className="ml-1 w-0 h-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "4px solid #888",
                  marginTop: "4px",
                }}
                aria-label="dropdown indicator"
              />
            )}
          </div>
        );
      }
    }
  }, [
    isEditable,
    isSelected,
    cellValue,
    editValue,
    isCommentPopupOpen,
    advancedSettings?.selectNewOptionOnAdd,
    props.item,
  ]);

  // Popup logic
  const [isEditingComment, setIsEditingComment] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>) => {
    onCellMouseEnter(e, cellCoordinate);
  };

  const onDeleteComment = (comment: CommentData) => {
    deleteCommentHandler?.(comment, props.item);
    setOpenCommentCell(undefined);
  };

  const handleCellFocus = () => {
    if (isCommentPopupOpen) return;

    setTimeout(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, 0);
  };

  const wasSelected = useRef(false);

  // Replace the empty useEffect
  useEffect(() => {
    changeCellSelectionHandler();
  }, [isSelected, isEditable]);

  const changeCellSelectionHandler = async () => {
    if (isSelected) {
      wasSelected.current = true;
    } else if (wasSelected.current && isEditable && isSelected === false) {
      await handleBlur();
      wasSelected.current = false;
      setEditValue(cellValue);
    }
  };

  const [showOnLeft, setShowOnLeft] = useState(false);

  useEffect(() => {
    if (isCommentPopupOpen) {
      const td = document.getElementById(
        getCellId(props.rowIndex, props.columnIndex, props.fromArrayData)
      );
      if (td) {
        const tdRect = td.getBoundingClientRect();
        const tableRect = td.closest("table")?.getBoundingClientRect();

        if (tableRect) {
          // Check if popup would overflow on right side
          const wouldOverflow = tdRect.right + 220 > tableRect.right;
          setShowOnLeft(wouldOverflow);
        }
      }
    }
  }, [
    isCommentPopupOpen,
    props.rowIndex,
    props.columnIndex,
    props.fromArrayData,
  ]);

  return (
    <td
      id={getCellId(props.rowIndex, props.columnIndex, props.fromArrayData)}
      data-row-index={props.rowIndex}
      data-col-index={props.columnIndex}
      data-from-array={props.fromArrayData?.fromArray}
      data-array-index={props.fromArrayData?.index}
      //ref={tdRef}
      tabIndex={0}
      onFocus={handleCellFocus}
      style={{
        ...determineStyle,
        alignContent: "start",
        outline: isSelected ? "2px solid #3b82f6" : "none", // Use a more performant alternative to "auto"
      }}
      rowSpan={props.rowSpan}
      key={`item-${props.columnIndex}-${props.rowIndex}`}
      className={`relative ${
        !advancedSettings?.noBorder ? "border-solid border border-gray-200" : ""
      } ${isSelected ? "cell-selected" : ""}`}
      onKeyDown={onKeyDownHandler}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onContextMenu={(e) => {
        onRightClick(
          {
            rowIndex: props.rowIndex,
            columnIndex: props.columnIndex,
            fromArrayData: props.fromArrayData,
          },
          e
        );
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          cellCoordinate: {
            rowIndex: props.rowIndex,
            columnIndex: props.columnIndex,
            fromArrayData: props.fromArrayData,
          },
          item: props.item,
          header: processedLeafHeaders[props.columnIndex],
        });
      }}
    >
      {props.comments && props.comments.length > 0 && (
        <div
          onClick={() =>
            isCommentPopupOpen
              ? setOpenCommentCell(undefined)
              : setOpenCommentCell(cellCoordinate)
          }
          className="absolute top-0 right-0 "
          style={{
            width: 0,
            height: 0,
            borderTop: "10px solid var(--comment-color)", // Amber-400 or any color you want
            borderLeft: "10px solid transparent",
          }}
        ></div>
      )}

      {cellContent}

      {isCommentPopupOpen && (
        <div
          className={`absolute z-2000 w-[220px] bg-white border-2 border-[var(--comment-color)] rounded shadow-lg p-2 px-3 top-0 ${
            showOnLeft ? "left-0 ml-[-220px]" : "right-0 mr-[-220px]"
          }`}
        >
          <CommentPopup
            comment={
              props.comments?.[0] || {
                text: "",
                propertyId: props.header.id,
                value: props.item[props.header.id],
                date: new Date(),
              }
            }
            columnId={props.header.id}
            isNewComment={props.comments?.length === 0}
            saveComment={(comment) => {
              saveCommentHandler(comment, props.item);
            }}
            deleteComment={(comment) => onDeleteComment(comment)}
            setIsEditing={setIsEditingComment}
            isEditing={isEditingComment || props.comments?.length === 0}
          ></CommentPopup>
        </div>
      )}
    </td>
  );
});

export default BaseTableCell;
