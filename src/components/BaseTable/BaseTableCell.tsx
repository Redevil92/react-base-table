import { CSSProperties, useEffect, useRef, useState } from "react";
import CustomRenderItem from "./CustomRenderItem";
import BaseTableHeader, { TableHeaderType } from "./models/BaseTableHeaders";
import TableItem from "./models/TableItem";

export interface BaseTableCellProps {
  header: BaseTableHeader;
  item: TableItem;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  isInExpandedSelection: boolean;
  noBorder?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  contrastRow?: boolean;
  onClick?: (rowIndex: number, columnIndex: number) => void;
  onKeyDown?: (
    e: React.KeyboardEvent,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onEnter?: (
    editValue: string | number | undefined,
    item: TableItem,
    header: BaseTableHeader
  ) => void;
  onBlur?: (
    editValue: string | number | undefined,

    item: TableItem,
    header: BaseTableHeader
  ) => void;
  onChange?: (
    editValue: string | number | undefined,
    rowIndex: number,
    item: TableItem,
    header: BaseTableHeader
  ) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
}

export default function BaseTableCell(props: Readonly<BaseTableCellProps>) {
  const [editValue, setEditValue] = useState(props.item[props.header.id]);

  useEffect(() => {
    // console.log("useEffect called for BaseTableCell");
    setEditValue(props.item[props.header.id]);
  }, [props.item, props.header.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log("handleChange called", e.target.value, editValue);
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    props.onBlur?.(editValue, props.item, props.header);
  };

  const onKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      props.onEnter?.(editValue, props.item, props.header);
    } else if (e.key === "Escape") {
      setEditValue(props.item[props.header.id]); // Reset to original value on Escape
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

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const tdRef = useRef<HTMLTableCellElement>(null);
  const [cellSize, setCellSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!props.isSelected) {
      return;
    }

    // Use a small timeout to ensure the input/select is rendered
    const focusTimer = setTimeout(() => {
      if (
        props.header.editOptions?.type === TableHeaderType.LIST &&
        selectRef.current
      ) {
        selectRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      } else if (tdRef.current) {
        tdRef.current.focus();
      }
    }, 0);

    return () => clearTimeout(focusTimer);
  }, [props.isSelected]);

  useEffect(() => {
    if (tdRef.current) {
      setCellSize({
        width: tdRef.current.offsetWidth,
        height: tdRef.current.offsetHeight,
      });
    }
  }, [props.isSelected, editValue]);

  const inputStyle: React.CSSProperties = {
    width: "100%", // 8px padding

    height: cellSize.height ? `${cellSize.height - 10}px` : "calc(100% - 8px)", // 8px padding
    // boxSizing: "border-box" as React.CSSProperties["boxSizing"],
    outline: "none",
    border: "none",
    background: "transparent",
  };

  const renderCellContent = () => {
    if (
      props.isSelected &&
      props.header.editOptions?.editable &&
      !props.disabled
    ) {
      switch (props.header.editOptions.type) {
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
            <select
              ref={selectRef}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              style={inputStyle}
            >
              {props.header.editOptions.options?.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
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
        return <CustomRenderItem item={props.item} header={props.header} />;
      } else {
        return <span>{props.item[props.header.id]}</span>;
      }
    }
  };

  return (
    <td
      ref={tdRef}
      tabIndex={0}
      onClick={
        props.onClick
          ? () => props.onClick!(props.rowIndex, props.columnIndex)
          : undefined
      }
      style={{ ...props.style, textAlign: props.header.align }}
      key={`item-${props.columnIndex}-${props.rowIndex}`}
      className={` ${!props.noBorder ? "border-solid border  " : ""} 
                     
                      ${props.rowIndex % 2 || !props.contrastRow ? "" : "bg-blue-50/50"} 
                      ${props.isInExpandedSelection ? "bg-blue-100" : ""} 
                      ${props.isSelected ? "outline-2  outline-radius outline-blue-500! bg-transparent " : "outline-none"}
                       ${props.disabled ? "bg-gray-100! " : ""}  
                      `}
      onKeyDown={onKeyDownHandler}
      onMouseDown={props.onMouseDown}
      onMouseEnter={props.onMouseEnter}
    >
      {renderCellContent()}
      {props.columnIndex === 0 && <>{props.rowIndex}</>}
    </td>
  );
}

// export default memo(BaseTableCell, (prevProps, nextProps) => {
//   // Only re-render when these specific props change
//   return (
//     prevProps.isSelected === nextProps.isSelected &&
//     prevProps.isInExpandedSelection === nextProps.isInExpandedSelection &&
//     prevProps.disabled === nextProps.disabled &&
//     prevProps.item[prevProps.header.id] ===
//       nextProps.item[nextProps.header.id] &&
//     prevProps.rowIndex === nextProps.rowIndex &&
//     prevProps.columnIndex === nextProps.columnIndex &&
//     prevProps.noBorder === nextProps.noBorder &&
//     prevProps.contrastRow === nextProps.contrastRow
//   );
// });
