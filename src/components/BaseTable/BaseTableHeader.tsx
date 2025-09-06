import type BaseTableHeader from "./models/BaseTableHeaders";
import type TableItem from "./models/TableItem";
import type ActiveTableFilter from "./models/ActiveTableFilter";
import TableFilter from "./TableFilter";

import { mdiArrowDown, mdiArrowUp, mdiCloseCircle } from "@mdi/js";
import Icon from "@mdi/react";

import { FilterTypes } from "../../enum/FilterTypes";

export interface BaseTableProps {
  header: BaseTableHeader;
  noBorder?: boolean;
  showFilter?: boolean;
  tableRef?: React.RefObject<HTMLTableElement>;
  activeFilter?: ActiveTableFilter;
  ascendingOrder?: boolean;
  isSorted?: boolean;
  filteredItems: TableItem[];
  onShowFilter?: (show: boolean, filterId: string) => void;
  onResetSort?: () => void;
  onSortByColumn?: (header: BaseTableHeader) => void;
  onSetFilter?: (headerId: string, itemsToHide: string[] | number[]) => void;
}

export default function BaseTable({
  header,
  noBorder,
  showFilter,
  tableRef,
  activeFilter,
  ascendingOrder,
  isSorted,
  filteredItems,
  onShowFilter,
  onResetSort,
  onSortByColumn,
  onSetFilter,
}: Readonly<BaseTableProps>) {
  const getFilterItemsForHeader = (headerId: string): string[] | number[] => {
    let items = filteredItems.map((item) => item[headerId]);

    if (activeFilter) {
      items = items.concat(activeFilter.itemsToHide);
    }

    return [...new Set(items)] as string[] | number[];
  };

  return (
    <>
      <th
        className={`${
          !noBorder ? "border-solid border border-gray-300! bg-slate-100" : ""
        } `}
        key={`header-${header.id}`}
      >
        <div className="flex justify-between">
          <div className="flex">
            {header.customHeader ? (
              header.customHeader(header)
            ) : (
              <button
                onClick={() => onSortByColumn?.(header)}
                className={`font-semibold bg-transparent text-left text-slate-600 text-xs border-none outline-hidden! whitespace-pre ${
                  header.sortable
                    ? "cursor-pointer hover:underline"
                    : "cursor-default"
                }`}
              >
                {header.text}
              </button>
            )}

            {isSorted && (
              <>
                <Icon
                  path={ascendingOrder ? mdiArrowUp : mdiArrowDown}
                  color={"grey"}
                  size={0.6}
                />
                <button
                  onClick={onResetSort}
                  className={`border-solid border bg-slate-300 hover:bg-slate-400! hover:border-transparent cursor-pointer  rounded-lg h-min  focus:outline-hidden!
                         `}
                >
                  <Icon path={mdiCloseCircle} color={"grey"} size={0.6} />
                </button>
              </>
            )}
          </div>

          {header.hasFilter ? (
            <div className="ml-2">
              <TableFilter
                show={!!showFilter}
                tableRef={tableRef}
                currentFilter={activeFilter}
                filterName={header.text}
                headerId={header.id}
                filterType={FilterTypes.STRING}
                items={getFilterItemsForHeader(header.id)}
                itemsToHide={activeFilter?.itemsToHide ?? []}
                onShowOrHide={(show: boolean) =>
                  onShowFilter?.(show, header.id)
                }
                onSetFilter={(id, itemsToHide: string[] | number[]) => {
                  onSetFilter?.(id, itemsToHide);
                }}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      </th>
    </>
  );
}
