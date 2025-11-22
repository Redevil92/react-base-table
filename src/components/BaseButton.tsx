import Icon from "@mdi/react";
import { useMemo } from "react";

interface BaseButtonInterface {
  text?: string;
  id?: string;
  onClick: () => void;
  ghost?: boolean;
  small?: boolean;
  circle?: boolean;
  tooltip?: string;
  tooltipRight?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  iconColorDisabled?: string;
  type?: "button" | "submit" | "reset";
}

export default function BaseButton(props: Readonly<BaseButtonInterface>) {
  const iconSize = useMemo(() => {
    if (props.iconSize) {
      return props.iconSize;
    }
    return props.small ? 0.8 : 1;
  }, [props.iconSize, props.small]);

  const button = (
    <button
      type={props.type ?? "button"}
      id={props.id}
      className={`btn ${props.className ?? ""} ${
        props.ghost ? " btn-ghost" : ""
      } ${props.small ? "btn-xs" : "btn-sm"} content-center ${
        props.circle ? "btn-circle" : ""
      }`}
      onClick={props.onClick}
      disabled={props.disabled === true}
    >
      {props.icon && (
        <Icon
          path={props.icon ?? ""}
          color={
            props.disabled
              ? props.iconColorDisabled ?? "lightgrey"
              : props.iconColor
          }
          size={iconSize}
        />
      )}

      {props.text && (
        <div className={`text-${props.small ? "xs" : "sm"}`}>{props.text}</div>
      )}
    </button>
  );

  return (
    <>
      {props.tooltip ? (
        <div
          className={`tooltip ${
            props.tooltipRight ? "tooltip-right" : "tooltip-top"
          } tooltip-top before:whitespace-pre-wrap text-left`}
          data-tip={`${props.tooltip}`}
        >
          {button}
        </div>
      ) : (
        button
      )}
    </>
  );
}
