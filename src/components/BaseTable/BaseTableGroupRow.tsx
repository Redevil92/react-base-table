import { ReactNode } from "react";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import BaseButton from "../BaseButton";

interface BaseTableGroupRowProps {
  groupByCustomRender?: (groupBy: string, value: string) => ReactNode;
  colSpan: number;
  groupBy: string;
  groupName: string; // This is the reliable identifier for the group
  isCollapsed: boolean;
  onCollapseGroup: (group: string) => void;
}

export default function BaseTableGroupRow(
  props: Readonly<BaseTableGroupRowProps>
) {
  return (
    <tr className="bg-[#C294E910]">
      {props.groupByCustomRender ? (
        props.groupByCustomRender(props.groupBy, props.groupName)
      ) : (
        <td colSpan={props.colSpan} className="font-semibold">
          <BaseButton
            onClick={() => {
              // We only use groupName for collapsing, not index
              console.log("++++++Collapse group:", props.groupName);
              props.onCollapseGroup(props.groupName);
            }}
            className="mb-1 h-5 min-h-5 bg-[#DADADA] border-none"
            iconSize={20}
            small
            circle
            icon={props.isCollapsed ? mdiChevronUp : mdiChevronDown}
          />
          {/* <button
            onClick={() => props.onCollapseGroup(props.groupName)}
            className="btn btn-xs btn-circle btn-primary mr-2"
          >
            {props.isCollapsed ? <span>+</span> : <span>-</span>}
          </button> */}
          <span>{props.groupName}</span>
        </td>
      )}
    </tr>
  );
}
