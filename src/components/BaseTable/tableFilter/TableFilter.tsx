import Icon from "@mdi/react";
import { mdiFilter } from "@mdi/js";
import { useRef } from "react";
import { FilterTypes } from "../../../enum/FilterTypes";
import type ActiveTableFilter from "../models/ActiveTableFilter";

import FilterDropdown from "./FilterDropdown";
import type { NumberCondition } from "./filterImplementations/NumberFilter/NumberFilter";

interface TableFilterProps {
  show: boolean;
  currentFilter?: ActiveTableFilter;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  filterName: string;
  headerId: string;
  filterType: FilterTypes;
  items: string[] | number[];
  itemsToHide: string[] | number[];
  onShowOrHide: (show: boolean) => void;
  onSetFilter: (
    id: string,
    valueToFilter: string[] | number[],
    numberCondition?: NumberCondition[]
  ) => void;
}

function TableFilter(props: Readonly<TableFilterProps>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={filterButtonRef}
        onClick={() => props.onShowOrHide(!props.show)}
        className={`border-solid border hover:!border-primary cursor-pointer border-gray-300 rounded  focus:outline-hidden! ${
          props.currentFilter ? "bg-purple-800" : "bg-white"
        } `}
      >
        <Icon
          path={mdiFilter}
          color={props.currentFilter ? "white" : "grey"}
          size={0.6}
        />
      </button>
      <FilterDropdown
        {...props}
        filterButtonRef={filterButtonRef}
        wrapperRef={wrapperRef}
      />
    </div>
  );
}

export default TableFilter;

