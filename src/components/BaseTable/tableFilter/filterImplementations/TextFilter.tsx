import { type FormEvent, useEffect, useMemo, useState } from "react";

import BaseButton from "../../../BaseButton";
import { FilterTypes } from "../../../../enum/FilterTypes";
import {
  useActiveFilters,
  useTableDataActions,
} from "../../../../stores/tableDataStore";
import { alphabeticalSort } from "../../../../utils/sorting";

interface TextFilterProps {
  headerId: string;
  filterType: FilterTypes;
  items: string[] | number[];
  onShowOrHide: (show: boolean) => void;
}

function TextFilter(props: Readonly<TextFilterProps>) {
  const { setActiveFilter } = useTableDataActions();
  const activeFilters = useActiveFilters();

  const currentActiveFilter = useMemo(() => {
    return activeFilters.find((filter) => filter.headerId === props.headerId);
  }, [activeFilters, props.headerId]);

  const [searchValue, setSearchValue] = useState("");

  const [filteredOutItems, setFilteredOutItems] = useState<(string | number)[]>(
    []
  );

  useEffect(() => {
    setFilteredOutItems(currentActiveFilter?.itemsToHide ?? []);
  }, [currentActiveFilter?.itemsToHide]);

  const filteredItems = useMemo(() => {
    let filteredItems: (string | number)[] = [];
    if (!searchValue) {
      return [...props.items];
    }

    filteredItems = [...props.items].filter((item) =>
      item
        ?.toString()
        .toLocaleLowerCase()
        .includes(searchValue?.toString().toLocaleLowerCase())
    );

    if (props.filterType === FilterTypes.STRING) {
      filteredItems = (filteredItems as string[]).sort(alphabeticalSort);
    }

    return filteredItems;
  }, [searchValue, props.items]);

  const addFilterHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchValue) {
      setActiveFilter(props.headerId, [searchValue]);
    }
  };

  const clearAllItemHandler = () => {
    setFilteredOutItems([...props.items] as (string | number)[]);
  };

  const selectAllItemHandler = () => {
    setFilteredOutItems([]);
  };

  const onItemCheck = (item: string | number) => {
    const index = filteredOutItems.findIndex((i) => i === item);
    let updatedElements = [...filteredOutItems];

    if (index === undefined) return;

    if (index === -1) {
      updatedElements = [...updatedElements, item];
    } else {
      updatedElements.splice(index, 1);
    }
    setFilteredOutItems(updatedElements);
  };

  const setFilterSelection = () => {
    const checkedShowFilter = filteredItems.filter(
      (item) => !filteredOutItems.includes(item)
    );
    const itemsToHide = [...props.items].filter(
      (item) => !checkedShowFilter.includes(item)
    );

    setActiveFilter(
      props.headerId,
      itemsToHide.map((item) => item) as string[] | number[]
    );
  };

  return (
    <div>
      <div className="font-semibold text-sm mb-1">Filter by value:</div>
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
          className="mr-4 cursor-pointer hover:border-none! border-none! focus:outline-hidden! bg-transparent btn-sm"
        >
          Select All
        </button>
        <button
          onClick={clearAllItemHandler}
          onFocus={() => {}}
          className="cursor-pointer hover:border-none! border-none! focus:outline-hidden! bg-transparent btn-sm"
        >
          Clear
        </button>
      </div>
      <div
        className="overflow-auto max-h-44 mt-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* {<div>{props.items.length}</div>} */}
        {filteredItems.map((item, index) => {
          return (
            <div key={`filter-item-${item}-${index}`} className="flex mt-2">
              <input
                type="checkbox"
                onClick={() => onItemCheck(item)}
                readOnly
                checked={!filteredOutItems.includes(item)}
                className="mr-2 "
              />
              <p className="text-xs">
                {item?.toString() || <span className="italic">(Blanks)</span>}
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
  );
}

export default TextFilter;
