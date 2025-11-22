import { type RefObject, useEffect, useRef, useState } from "react";
import useClickOutside from "../../../hooks/useClickOutside";
import { FilterTypes } from "../../../enum/FilterTypes";
import TextFilter from "./filterImplementations/TextFilter";
import NumberFilter from "./filterImplementations/NumberFilter/NumberFilter";
import * as ReactDOM from "react-dom";

interface TableFilterProps {
  show: boolean;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  headerId: string;
  filterType: FilterTypes;
  items: string[] | number[];
  filterButtonRef: React.RefObject<HTMLButtonElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onShowOrHide: (show: boolean) => void;
}

function FilterDropdown(props: Readonly<TableFilterProps>) {
  const [showRight, setShowRight] = useState<boolean>(false);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.show && filterRef.current) {
      const boundingRef = filterRef.current.getBoundingClientRect();
      const tableBoundingRef = props.tableRef?.current?.getBoundingClientRect();
      const tableWidth = tableBoundingRef?.width ?? 0;

      const outsideTable = boundingRef.width + boundingRef.x > tableWidth;
      setShowRight(outsideTable);
    } else {
      setShowRight(false);
    }
  }, [props.show]);

  useClickOutside(
    [props.wrapperRef, filterRef] as RefObject<HTMLElement>[],
    () => {
      if (props.show) {
        props.onShowOrHide(false);
      }
    }
  );

  const [filterPosition, setFilterPosition] = useState<{
    top: number;
    left: number;
  }>();

  useEffect(() => {
    if (props.show && props.filterButtonRef.current) {
      const rect = props.filterButtonRef.current.getBoundingClientRect();
      setFilterPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [props.show]);

  const getFilterComponent = (filterType: FilterTypes) => {
    switch (filterType) {
      case FilterTypes.NUMBER:
        return NumberFilter;
      // case FilterTypes.DATE:
      //   return DateFilter;
      case FilterTypes.STRING:
      default:
        return TextFilter;
    }
  };

  const FilterComponent = getFilterComponent(props.filterType);

  const dropdownElement =
    props.show && filterPosition
      ? ReactDOM.createPortal(
          <div
            ref={filterRef}
            className={`fixed mt-1 bg-white shadow p-3 w-60 z-300 rounded-md font-normal border border-gray-300 ${
              showRight ? "right-0" : ""
            }`}
            style={{
              top: `${filterPosition.top}px`,
              left: `${filterPosition.left}px`,
            }}
          >
            <FilterComponent
              headerId={props.headerId}
              filterType={props.filterType}
              items={props.items}
              onShowOrHide={props.onShowOrHide}
            />
          </div>,
          document.body
        )
      : null;

  return <div>{props.show ? dropdownElement : ""}</div>;
}

export default FilterDropdown;
