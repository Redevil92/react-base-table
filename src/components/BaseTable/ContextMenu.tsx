import { type Context, Fragment, useEffect, useRef, useState } from "react";
import type TableItem from "./models/TableItem";
import { mdiCommentPlus } from "@mdi/js";
import Icon from "@mdi/react";
import type ContextMenuAction from "./models/ContextMenuAction";

interface ContextMenuProps {
  x: number;
  y: number;
  item: TableItem;
  itemCoordinate: { rowIndex: number; columnIndex: number };
  actions: ContextMenuAction[];
  onClose: () => void;
}

const menuStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 1000,
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: 4,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  minWidth: 160,
};

export default function ContextMenu(props: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: props.x, top: props.y });

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        props.onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [props.onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const rect = menuRef.current.getBoundingClientRect();
      let left = props.x;
      let top = props.y;

      // Adjust right overflow
      if (left + rect.width > innerWidth) {
        left = innerWidth - rect.width - 8; // 8px padding from edge
      }
      // Adjust bottom overflow
      if (top + rect.height > innerHeight) {
        top = innerHeight - rect.height - 8;
      }
      // Prevent negative positions
      left = Math.max(left, 8);
      top = Math.max(top, 8);

      setPos({ left, top });
    }
  }, [props.x, props.y]);

  const handleActionClick = (
    event: React.MouseEvent,
    action: ContextMenuAction
  ) => {
    event.preventDefault();
    action.onClick(props.item, props.itemCoordinate);
    props.onClose();
  };

  return (
    <div ref={menuRef} style={{ ...menuStyle, left: pos.left, top: pos.top }}>
      <ul className="menu menu-sm p-0.5 bg-base-200 rounded-box min-w-55 max-w-xs w-full">
        {props.actions.map((action, index) => (
          <Fragment key={index}>
            {action.customRender ? (
              <>
                <li onClick={(e) => handleActionClick(e, action)}>
                  <a>
                    {action.icon && (
                      <Icon
                        path={action?.icon}
                        color={action.iconColor}
                        size={0.8}
                      />
                    )}

                    {action.text}
                    {action.customRender()}
                  </a>
                </li>
              </>
            ) : (
              <>
                <li onClick={(e) => handleActionClick(e, action)}>
                  <a>
                    {action.icon && (
                      <Icon
                        path={action?.icon}
                        color={action.iconColor}
                        size={0.8}
                      />
                    )}

                    {action.text}
                  </a>
                </li>
              </>
            )}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
