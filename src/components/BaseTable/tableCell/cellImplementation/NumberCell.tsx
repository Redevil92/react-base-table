import { useEffect, useState } from "react";
import { formatNumber } from "./formatNumberFunctions";

interface NumberCellProps {
  // Define your props here
  id: string;
  cellValue: string | number | null | undefined;
  initialValue?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function NumberCell(props: Readonly<NumberCellProps>) {
  const [localValue, setLocalValue] = useState<string>(
    formatNumber(props.initialValue ?? "")
  );

  useEffect(() => {
    setLocalValue(formatNumber(props.initialValue ?? ""));
  }, []);

  const onKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setLocalValue(formatNumber(props.cellValue ?? ""));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", // 8px padding
    // height: cellSize.height ? `${cellSize.height - 10}px` : "calc(100% - 8px)", // 8px padding
    // boxSizing: "border-box" as React.CSSProperties["boxSizing"],
    outline: "none",
    border: "none",
    background: "transparent",
  };

  return (
    <input
      id={props.id}
      ref={props.inputRef}
      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      type="string"
      inputMode="decimal"
      value={localValue}
      onKeyDown={onKeyDownHandler}
      onChange={(event) => {
        setLocalValue(event.target.value);
        props.onChange(event);
      }}
      onBlur={props.onBlur}
      style={inputStyle}
    />
  );
}

