import type { ChangeEvent } from "react";

interface BaseCheckboxInterface {
  checked: boolean;
  disabled?: boolean;
  className?: string;
  small?: boolean;
  label?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function BaseCheckbox(props: Readonly<BaseCheckboxInterface>) {
  return (
    <input
      type="checkbox"
      className={`checkbox checkbox-primary ${
        props.small ? "checkbox-xs" : "checkbox-sm"
      } ${props.className ? props.className : ""}`}
      checked={props.checked}
      onChange={props.onChange}
      disabled={props.disabled}
    />
  );
}
