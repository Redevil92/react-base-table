import Icon from "@mdi/react";
import { mdiFilter } from "@mdi/js";

import { FormEvent, useEffect, useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import { FilterTypes } from "../../enum/FilterTypes";
import BaseButton from "../BaseButton";
import ActiveTableFilter from "./models/ActiveTableFilter";

interface TableFilterProps {
  show: boolean;
  currentFilter?: ActiveTableFilter;
  filterName: string;
  headerId: string;
  filterType: FilterTypes;
  items: string[];
  itemsToHide: string[];
  onShowOrHide: (show: boolean) => void;
  onSetFilter: (id: string, valueToFilter: string[]) => void;
}

function TableFilter(props: Readonly<TableFilterProps>) {
  const [searchValue, setSearchValue] = useState("");
  const [showRight, setShowRight] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [filteredOutItems, setFilteredOutItems] = useState<string[]>([]);

  useEffect(() => {
    setFilteredOutItems(props.currentFilter?.itemsToHide ?? []);
  }, [props.currentFilter?.itemsToHide]);

  useEffect(() => {
    if (props.show && filterRef.current) {
      const boundingRef = filterRef.current.getBoundingClientRect();
      const tableMargin = 30;
      const outsideScreen =
        boundingRef.width + boundingRef.x + tableMargin > window.innerWidth;
      setShowRight(outsideScreen);
    } else {
      setShowRight(false);
    }
  }, [props.show]);

  useClickOutside(wrapperRef, () => {
    if (props.show) {
      props.onShowOrHide(false);
    }
  });

  const getFilteredItems = () => {
    if (!searchValue) {
      return [...props.items];
    }

    return [...props.items].filter((item) =>
      item
        ?.toString()
        .toLocaleLowerCase()
        .includes(searchValue?.toString().toLocaleLowerCase())
    );
  };

  const addFilterHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchValue) {
      props.onSetFilter(props.headerId, [searchValue]);
    }
  };

  const clearAllItemHandler = () => {
    setFilteredOutItems([...props.items]);
  };

  const selectAllItemHandler = () => {
    setFilteredOutItems([]);
  };

  const onItemCheck = (item: string) => {
    const index = filteredOutItems.findIndex((i) => i === item);
    let updatedElements = [...filteredOutItems];
    if (index === -1) {
      updatedElements = [...updatedElements, item];
    } else {
      updatedElements.splice(index, 1);
    }
    setFilteredOutItems(updatedElements);
  };

  const setFilterSelection = () => {
    const shownFilters = getFilteredItems();

    const checkedShowFilter = shownFilters.filter(
      (item) => !filteredOutItems.includes(item)
    );
    const itemsToHide = props.items.filter(
      (item) => !checkedShowFilter.includes(item)
    );

    props.onSetFilter(props.headerId, itemsToHide);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => props.onShowOrHide(!props.show)}
        className={`border-solid border hover:!border-primary cursor-pointer border-gray-300 rounded  focus:!outline-none ${
          props.currentFilter ? "bg-purple-800" : "bg-white"
        } `}
      >
        <Icon
          path={mdiFilter}
          color={props.currentFilter ? "white" : "grey"}
          size={0.6}
        />
      </button>
      {props.show ? (
        <div
          ref={filterRef}
          className={`absolute mt-1 bg-white shadow-sm p-3 w-60 z-10 rounded-md font-normal border border-border-color-light ${
            showRight ? "right-0" : ""
          }`}
        >
          <div className="font-semibold mb-1">Filter by value:</div>
          <form onSubmit={addFilterHandler}>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event?.target.value)}
              placeholder="Search..."
              className="input input-bordered input-xs w-full max-w-xs"
            />
            <input type="submit" value="" />
          </form>
          <div className="flex text-xs mt-1 font-semibold text-primary">
            <button
              onClick={selectAllItemHandler}
              onFocus={() => {}}
              className="mr-4 cursor-pointer hover:!border-none !border-none focus:!outline-none bg-transparent btn-sm"
            >
              Select All
            </button>
            <button
              onClick={clearAllItemHandler}
              onFocus={() => {}}
              className="cursor-pointer hover:!border-none !border-none focus:!outline-none bg-transparent btn-sm"
            >
              Clear
            </button>
          </div>
          <div
            className="overflow-auto max-h-44 mt-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {getFilteredItems().map((item) => {
              return (
                <div key={`filter-item-${item}`} className="flex mt-2">
                  <input
                    type="checkbox"
                    onClick={() => onItemCheck(item)}
                    readOnly
                    checked={!filteredOutItems.includes(item)}
                    className="checkbox checkbox-primary checkbox-xs mr-2"
                  />
                  <p className="text-xs">
                    {item?.toString() || (
                      <span className="italic">(Blanks)</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex float-end mt-2">
            <BaseButton
              onClick={() => {
                setFilterSelection();
                props.onShowOrHide(false);
              }}
              text="OK"
              iconColor="#6161bb"
              small
            />
            <BaseButton
              className="ml-1"
              onClick={() => props.onShowOrHide(false)}
              text="Cancel"
              iconColor="#6161bb"
              small
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default TableFilter;
