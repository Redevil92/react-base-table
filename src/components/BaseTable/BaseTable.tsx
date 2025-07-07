import { CSSProperties, useMemo, useState } from "react";
import BaseTableHeader from "./models/BaseTableHeaders";
import TableItem from "./models/TableItem";
import ActiveTableFilter from "./models/ActiveTableFilter";
import TableFilter from "./TableFilter";

import {
  mdiArrowDown,
  mdiArrowUp,
  mdiCloseCircle,
  mdiFilterOff,
} from "@mdi/js";
import Icon from "@mdi/react";
import { alphabeticalSort, alphabeticalSortInverse } from "../../utils/sorting";
import BaseButton from "../BaseButton";
import { FilterTypes } from "../../enum/FilterTypes";

export interface BaseTableProps {
  height?: string;
  headers: BaseTableHeader[];
  items: TableItem[];
  marginTop?: string;
  noBorder?: boolean;
  pinColumns?: boolean;
  alignCenterInLine?: boolean;
  currentSortId?: string;
  highlightCondition?: {
    propertyId: string;
    value: unknown;
    style: CSSProperties;
  }[];
  activeFilters?: ActiveTableFilter[];
  onResetSort?: () => void;
  onRowDoubleClick?: (item: TableItem) => void;
  onSortByColumn?: (columnId: string) => void;
}

export default function BaseTable(props: Readonly<BaseTableProps>) {
  const [filterToShow, setFilterToShow] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveTableFilter[]>(
    props.activeFilters ?? []
  );

  const [ascendingOrder, setAscendingOrder] = useState(true);

  const clearActiveFilters = () => {
    setActiveFilters([]);
  };

  const filteredItems = useMemo(() => {
    let items = [...props.items];

    activeFilters.forEach((filter) => {
      items = items.filter((item) => {
        // handle number case, for now we stick to string filters
        return !filter.itemsToHide.includes(item[filter.headerId]);
      });
    });

    // no sorting case
    if (!props.currentSortId) {
      return items;
    }

    const header = props.headers.find(
      (header) => header.id === props.currentSortId
    );

    // sort
    if (header?.customSort) {
      items.sort((a: TableItem, b: TableItem) =>
        header.customSort!(a, b, ascendingOrder)
      );
    } else {
      const sortingFunction = ascendingOrder
        ? alphabeticalSortInverse
        : alphabeticalSort;
      items.sort((a: TableItem, b: TableItem) => {
        return sortingFunction(
          b[props.currentSortId!],
          a[props.currentSortId!]
        );
      });
    }

    return items;
  }, [
    props.currentSortId,
    props.items,
    props.headers,
    ascendingOrder,
    activeFilters,
  ]);

  const showFilterHandler = (show: boolean, filterId: string) => {
    if (!show) {
      setFilterToShow("");
      return;
    }
    setFilterToShow(filterId);
  };

  const getFilterForHeader = (headerId: string) => {
    return activeFilters.find((filter) => filter.headerId === headerId);
  };

  const setActiveTableFilters = (headerId: string, itemsToHide: string[]) => {
    const filters = [...activeFilters];
    const index = filters.findIndex((filter) => filter.headerId === headerId);

    if (index !== -1) {
      if (itemsToHide.length > 0) {
        //update filter
        filters[index] = { headerId, itemsToHide };
      } else {
        // remove filter
        filters.splice(index, 1);
      }
    } else if (itemsToHide.length > 0) {
      // add filter
      filters.push({ headerId, itemsToHide });
    }

    setActiveFilters(filters);
  };

  const getFilterItemsForHeader = (headerId: string) => {
    let items = filteredItems.map((item) => item[headerId]);
    const currentFilter = activeFilters.find(
      (filter) => filter.headerId === headerId
    );

    if (currentFilter) {
      items = items.concat(currentFilter.itemsToHide);
    }

    return [...new Set(items)];
  };

  const onRowDoubleClick = (item: TableItem) => {
    if (props.onRowDoubleClick) {
      props.onRowDoubleClick(item);
    }
  };

  const onSortByColumn = (header: BaseTableHeader | undefined) => {
    if (!header?.sortable) {
      return;
    }

    let isAscendingOrder;
    if (props.currentSortId === header.id) {
      isAscendingOrder = !ascendingOrder;
    } else {
      isAscendingOrder = true;
    }
    setAscendingOrder(isAscendingOrder);

    props.onSortByColumn?.(header.id);
  };

  const getRowStyle = (row: TableItem) => {
    const style = props.highlightCondition?.find(
      (condition) => row[condition.propertyId] === condition.value
    );

    if (!style) {
      return {};
    }

    return style.style;
  };

  return (
    <>
      {activeFilters.length > 0 && (
        <div style={{ width: "100%", display: "flex" }}>
          <BaseButton
            onClick={clearActiveFilters}
            className="mb-1 h-5 min-h-5 w-36 flex"
            small
            text="Clear all filters"
            iconSize={0.6}
            icon={mdiFilterOff}
          />
        </div>
      )}

      <div>
        <button className={`btn btn-xs btn-accent btn-soft`}>Small</button>
        <button className="btn btn-sm btn-accent btn-soft">Small</button>
        <button className="btn  btn-accent btn-soft">Small</button>
      </div>

      <div
        className="overflow-x-auto"
        style={{
          overflow: "auto", //our scrollable table container
          // position: 'relative', //needed for sticky header
          height:
            props.height ??
            `calc(100vh - ${props.marginTop ? props.marginTop : "4rem"})`, //should be a fixed height
          scrollbarWidth: "thin",
        }}
      >
        <table
          style={{ width: "100%", position: "unset" }}
          className={`table table-xs table-pin-rows ${
            props.pinColumns ? "table-pin-cols" : ""
          }  border border-gray-300!`}
        >
          <thead
            className=" border border-gray-300!"
            style={{
              top: 0,
              zIndex: 1,
            }}
          >
            <tr>
              {props.headers.map((header) => (
                <th
                  className={`${!props.noBorder ? "border-solid border border-gray-300! bg-slate-100" : ""} `}
                  key={`header-${header.id}`}
                >
                  <div className="flex justify-between">
                    <div className="flex">
                      {header.customHeader ? (
                        header.customHeader(header)
                      ) : (
                        <button
                          onClick={() => onSortByColumn(header)}
                          className={`font-semibold bg-transparent text-left text-slate-600 text-xs border-none outline-hidden! whitespace-pre ${
                            props.onRowDoubleClick && header.sortable
                              ? "cursor-pointer hover:underline"
                              : "cursor-default"
                          }`}
                        >
                          {header.text}
                        </button>
                      )}

                      {props.currentSortId === header.id && (
                        <>
                          <Icon
                            path={ascendingOrder ? mdiArrowUp : mdiArrowDown}
                            color={"grey"}
                            size={0.6}
                          />
                          <button
                            onClick={props.onResetSort}
                            className={`border-solid border bg-slate-300 hover:bg-slate-400! hover:border-transparent cursor-pointer  rounded-lg h-min  focus:outline-hidden!
                         `}
                          >
                            <Icon
                              path={mdiCloseCircle}
                              color={"grey"}
                              size={0.6}
                            />
                          </button>
                        </>
                      )}
                    </div>

                    {header.hasFilter ? (
                      <div className="ml-2">
                        <TableFilter
                          show={filterToShow === header.id}
                          currentFilter={getFilterForHeader(header.id)}
                          filterName={header.text}
                          headerId={header.id}
                          filterType={FilterTypes.STRING}
                          items={getFilterItemsForHeader(header.id)}
                          itemsToHide={
                            activeFilters.find(
                              (filter) => filter.headerId === header.id
                            )?.itemsToHide ?? []
                          }
                          onShowOrHide={(show: boolean) =>
                            showFilterHandler(show, header.id)
                          }
                          onSetFilter={setActiveTableFilters}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, i) => (
              <tr
                style={getRowStyle(item)}
                className={`${
                  props.onRowDoubleClick ? "cursor-pointer" : ""
                }  hover:outline-1 hover:outline-solid  hover:outline-[#4849b9fa]`}
                onDoubleClick={() => onRowDoubleClick(item)}
                key={`item-${i}`}
              >
                {props.headers.map((header, j) => (
                  <td
                    key={`item-${j}-${header.id}`}
                    className={` ${!props.noBorder ? "border-solid border  " : ""}  
                  ${props.alignCenterInLine && j === 0 ? "text-center" : ""}
                  ${i % 2 ? "" : "bg-blue-50/50"} `}
                  >
                    {header.customRender
                      ? header.customRender(item, header)
                      : item[header.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
          <tr>
            {props.headers.map((header) => (
              <th>{header.text}</th>
            ))}
          </tr>
        </tfoot> */}
        </table>
      </div>
    </>
  );
}
