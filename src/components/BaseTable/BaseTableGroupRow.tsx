import { mdiChevronDown, mdiChevronUp, mdiLink, mdiLinkLock } from "@mdi/js";
import BaseButton from "../BaseButton";
import Icon from "@mdi/react";
import type { ReactNode } from "react";

interface BaseTableGroupRowProps {
  groupByCustomRender?: (groupBy: string, value: string) => ReactNode;
  colSpan: number;
  groupBy: string;
  groupName: string; // This is the reliable identifier for the group
  isCollapsed: boolean;
  masterGroupName?: string; // Optional prop to indicate if this group is linked
  linkedGroupNames?: string[];
  onCollapseGroup: (group: string) => void;
  ref: React.Ref<HTMLTableRowElement>;
  dataIndex: number;
}

export default function BaseTableGroupRow(
  props: Readonly<BaseTableGroupRowProps>
) {
  return (
    <tr className="bg-[#C294E910]" ref={props.ref} data-index={props.dataIndex}>
      {props.groupByCustomRender ? (
        props.groupByCustomRender(props.groupBy, props.groupName)
      ) : (
        <td colSpan={props.colSpan} className="font-semibold">
          <div className="flex align-center items-center">
            <BaseButton
              key={props.groupName}
              id={props.groupName}
              onClick={() => props.onCollapseGroup(props.groupName)}
              className=" h-5 min-h-5 mx-4 bg-[#DADADA] border-none"
              iconSize={1}
              small
              circle
              icon={props.isCollapsed ? mdiChevronUp : mdiChevronDown}
            />

            <div className="ml-2">{props.groupName}</div>

            <div className="ml-8">
              {props.masterGroupName && (
                <div className="flex  font-normal  text-white bg-[#a0a0a0] rounded-2xl px-3">
                  <Icon path={mdiLinkLock} color="white" size={0.8} />
                  <div className="ml-2">
                    <span className="ml-1">Linked</span>
                  </div>
                </div>
              )}
              {props.linkedGroupNames && props.linkedGroupNames.length > 0 && (
                <div className="flex  font-normal  text-white bg-[#6B21A8] rounded-2xl px-3">
                  <Icon path={mdiLink} color="white" size={0.8} />
                  <div className="ml-2">
                    <span className="font-bold">
                      {props.linkedGroupNames.length}
                    </span>
                    <span className="ml-1"> linked groups</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
      )}
    </tr>
  );
}

