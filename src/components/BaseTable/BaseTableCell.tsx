import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CustomRenderItem from "./CustomRenderItem";
import type TableItem from "./models/TableItem";
import type CommentData from "./models/CommentData";
import CommentPopup from "./CommentPopup";
import { useCommentPopupContext } from "./contexts/useCommentPopupContext";
import type BaseTableHeader from "./models/BaseTableHeaders";
import { TableHeaderType } from "./models/BaseTableHeaders";
import ListCell from "./cellImplementation/ListCell";
import type CellCoordinate from "./models/CellCordinate";

export interface BaseTableCellProps {
  header: BaseTableHeader;
  item: TableItem;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  isInExpandedSelection: boolean;
  noBorder?: boolean;
  isInLinkedGroup?: boolean;
  style?: CSSProperties;
  contrastRow?: boolean;
  comments?: CommentData[];
  rowSpan?: number;
  fromArrayData?: {
    fromArray: string;
    index: number;
  };
  onClick?: (cellCoordinate: CellCoordinate) => void;
  onKeyDown?: (
    e: React.KeyboardEvent,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onEnter?: (
    editValue: string | number | undefined,
    item: TableItem,
    header: BaseTableHeader,
    cellCoordinate: CellCoordinate
  ) => void;
  onBlur?: (
    editValue: string | number | undefined,
    item: TableItem,
    header: BaseTableHeader,
    cellCoordinate: CellCoordinate
  ) => void;
  onChange?: (
    editValue: string | number | undefined,
    //rowIndex: number,
    cellCoordinate: CellCoordinate,
    item: TableItem,
    header: BaseTableHeader
  ) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  onContextMenu?: (
    rowIndex: number,
    columnIndex: number,
    item: TableItem,
    event: React.MouseEvent<HTMLTableCellElement>
  ) => void;
  onSaveComment?: (comment: CommentData, item: TableItem) => void;
  onDeleteComment?: (comment: CommentData, item: TableItem) => void;
  onAddOption?: (newOption: string, header: BaseTableHeader) => void;
}

export default function BaseTableCell(props: Readonly<BaseTableCellProps>) {
  const getDefaultValue = () => {
    if (props.fromArrayData) {
      return (props.item[props.header.fromArray!] as any[])[
        props.fromArrayData.index
      ][props.header.id] as string | number | undefined;
    }

    return props.item[props.header.id] as string | number | undefined;
  };

  const [editValue, setEditValue] = useState<string | number | undefined>(
    () => {
      return getDefaultValue();
    }
  );
  const { openCommentCell, setOpenCommentCell } = useCommentPopupContext();

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

  const handleBlur = () => {
    props.onBlur?.(editValue, props.item, props.header, {
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
    props.onMouseDown?.(e);
  };

  const onKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      props.onEnter?.(editValue, props.item, props.header, {
        rowIndex: props.rowIndex,
        columnIndex: props.columnIndex,
        fromArrayData: props.fromArrayData,
      });
    } else if (e.key === "Escape") {
      setEditValue(getDefaultValue()); // Reset to original value on Escape
    } else if (
      isInputFocused() &&
      ["ArrowRight", "ArrowLeft"].includes(e.key) &&
      !e.shiftKey
    ) {
      return;
    } else {
      if (["ArrowDown", "ArrowUp", "Tab"].includes(e.key)) {
        handleBlur();
      }
      props.onKeyDown?.(e, props.rowIndex, props.columnIndex);
    }
  };

  const isInputFocused = () => {
    return (
      document.activeElement === inputRef.current ||
      document.activeElement === selectRef.current
    );
  };

  const isCommentPopupOpen = useMemo(
    () =>
      openCommentCell?.columnIndex === props.columnIndex &&
      openCommentCell.rowIndex === props.rowIndex,
    [openCommentCell, props.columnIndex, props.rowIndex]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const tdRef = useRef<HTMLTableCellElement>(null);
  // const [cellSize, setCellSize] = useState<{ width: number; height: number }>({
  //   width: 0,
  //   height: 0,
  // });

  // useEffect(() => {
  //   if (tdRef.current) {
  //     setCellSize({
  //       width: tdRef.current.offsetWidth,
  //       height: tdRef.current.offsetHeight,
  //     });
  //   }
  // }, [props.isSelected, editValue]);

  const inputStyle: React.CSSProperties = {
    width: "100%", // 8px padding

    // height: cellSize.height ? `${cellSize.height - 10}px` : "calc(100% - 8px)", // 8px padding
    // boxSizing: "border-box" as React.CSSProperties["boxSizing"],
    outline: "none",
    border: "none",
    background: "transparent",
  };

  const isEditable = useMemo(() => {
    return (
      props.header.editOptions?.editable &&
      !props.isInLinkedGroup &&
      !props.header.editOptions.isDisabled?.(props.item, props.fromArrayData)
    );
  }, [
    props.header.editOptions?.editable,
    props.isInLinkedGroup,
    props.header.editOptions?.isDisabled,
    props.item,
  ]);

  const renderCellContent = () => {
    if (isEditable && props.isSelected) {
      switch (props.header.editOptions!.type) {
        case TableHeaderType.NUMBER:
          return (
            <input
              ref={inputRef}
              type="number"
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              style={inputStyle}
            />
          );
        case TableHeaderType.LIST:
          return (
            <ListCell
              value={editValue as string}
              options={props.header.editOptions!.options || []}
              onSelect={(value) => {
                setEditValue(value);
                props.onBlur?.(value, props.item, props.header, {
                  rowIndex: props.rowIndex,
                  columnIndex: props.columnIndex,
                  fromArrayData: props.fromArrayData,
                });
              }}
              addOption={(newOption) => {
                props.onAddOption?.(newOption, props.header);
              }}
              hideOptions={isCommentPopupOpen}
            />
          );

        default:
          return (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
                style={inputStyle}
              />
            </div>
          );
      }
    } else {
      if (props.header.customRender) {
        return (
          <CustomRenderItem
            item={props.item}
            header={props.header}
            fromArrayData={props.fromArrayData}
          />
        );
      } else {
        return (
          <div className="flex justify-between">
            <span
              className="  truncate whitespace-nowrap overflow-ellipsis"
              title={String(props.item[props.header.id])}
            >
              {props.fromArrayData ? (
                <>
                  {props.item[props.header.fromArray!] &&
                  (props.item[props.header.fromArray!] as any[])[
                    props.fromArrayData.index
                  ]
                    ? (props.item[props.header.fromArray!] as any[])[
                        props.fromArrayData.index
                      ][props.header.id]
                    : ""}
                </>
              ) : (
                <> {props.item[props.header.id]}</>
              )}
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
  };

  // Popup logic
  const [isEditingComment, setIsEditingComment] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>) => {
    props.onMouseEnter?.(e);
  };

  const deleteCommentHandler = (comment: CommentData) => {
    if (props.onDeleteComment) {
      props.onDeleteComment(comment, props.item);
      setOpenCommentCell(undefined);
    }
  };

  return (
    <td
      ref={tdRef}
      tabIndex={0}
      onClick={
        props.onClick
          ? () =>
              props.onClick!({
                rowIndex: props.rowIndex,
                columnIndex: props.columnIndex,
                fromArrayData: props.fromArrayData,
              })
          : undefined
      }
      style={{
        ...props.style,
        textAlign: props.header.align,
        alignContent: "start",
        maxWidth: props.header.width ? `${props.header.width}px` : "none",
      }}
      rowSpan={props.rowSpan}
      key={`item-${props.columnIndex}-${props.rowIndex}`}
      className={`relative  ${
        !props.noBorder ? "border-solid border border-gray-200  " : ""
      } 
                      ${
                        props.rowIndex % 2 || !props.contrastRow
                          ? ""
                          : "bg-blue-50/50"
                      } 
                      ${props.isInExpandedSelection ? "bg-blue-100/50" : ""} 
                      ${
                        props.isSelected
                          ? "outline-2  outline-radius outline-blue-500! bg-transparent "
                          : "outline-none"
                      }
                       ${
                         props.isInLinkedGroup ||
                         (!isEditable &&
                           props.header.editOptions?.greyedOutIfNotEditable)
                           ? "bg-gray-200/50! "
                           : ""
                       }    
                      `}
      onKeyDown={onKeyDownHandler}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
      onContextMenu={
        props.onContextMenu
          ? (e) => {
              props.onContextMenu!(
                props.rowIndex,
                props.columnIndex,
                props.item,
                e
              );
            }
          : undefined
      }
    >
      {props.comments && props.comments.length > 0 && (
        <div
          onClick={() =>
            isCommentPopupOpen
              ? setOpenCommentCell(undefined)
              : setOpenCommentCell({
                  rowIndex: props.rowIndex,
                  columnIndex: props.columnIndex,
                })
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

      {renderCellContent()}

      {isCommentPopupOpen && (
        <div className="absolute z-2000 w-[220px] mr-[-220px] bg-white border-2 border-[var(--comment-color)] rounded shadow-lg p-2 px-3 top-0 right-0">
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
              props.onSaveComment?.(comment, props.item);
            }}
            deleteComment={(comment) => deleteCommentHandler(comment)}
            setIsEditing={setIsEditingComment}
            isEditing={isEditingComment || props.comments?.length === 0}
          ></CommentPopup>
        </div>
      )}
    </td>
  );
}

