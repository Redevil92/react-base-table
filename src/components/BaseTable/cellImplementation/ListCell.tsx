import { useMemo, useState } from "react";
import BaseButton from "../../BaseButton";
import { mdiArrowRight, mdiClose, mdiPlus } from "@mdi/js";

interface ListCellProps {
  // Define your props here
  value?: string;
  options: string[];
  onSelect: (value: string) => void;
  addOption?: (newOption: string) => void;
  disabled?: boolean;
  hideOptions?: boolean;
}

export default function ListCell(props: ListCellProps) {
  const [showOptions, setShowOptions] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const [optionToAdd, setOptionToAdd] = useState("");
  const [showAddOption, setShowAddOption] = useState(false);

  const filteredOptions = useMemo(() => {
    return props.options.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase() || "")
    );
  }, [[props.options]]);

  return (
    <div className="relative ">
      <div
        className="flex justify-between "
        onClick={() => setShowOptions(true)}
      >
        <div className=" truncate whitespace-nowrap overflow-ellipsis">
          {props.value}
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="ml-1 w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "4px solid #888",
            marginTop: "4px",
          }}
          aria-label="dropdown indicator"
        />
      </div>
      {showOptions && !props.hideOptions && (
        <div
          className="absolute  bg-base-100   border border-[var(--border-color)]  z-1 w-52 p-2 shadow-sm"
          style={{ left: "-8px", top: "23px" }}
        >
          <label className="input input-xs">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              required
              placeholder="Search"
            />
          </label>

          <div className="my-2">
            <BaseButton
              small
              icon={showAddOption ? mdiClose : mdiPlus}
              iconColor={!showAddOption ? "#6161BB" : "var(--error-color)"}
              text={showAddOption ? "Cancel" : "Add option"}
              onClick={() => {
                setShowAddOption(!showAddOption);
              }}
            />
            {showAddOption && (
              <div className="mt-2 flex">
                <input
                  value={optionToAdd}
                  onChange={(e) => setOptionToAdd(e.target.value)}
                  required
                  placeholder="Search"
                  className="input input-xs  outline-offset-0! outline-[#6161BB]! hover:outline-[#6161BB] focus:border-[#6161BB]"
                />
                <BaseButton
                  className="ml-1"
                  small
                  icon={mdiArrowRight}
                  iconColor={"#6161BB"}
                  circle
                  disabled={props.options.includes(optionToAdd.trim())}
                  onClick={() => {
                    props.addOption?.(optionToAdd.trim());
                    setOptionToAdd("");
                  }}
                  tooltip={
                    props.options.includes(optionToAdd.trim())
                      ? "Option already in the list"
                      : ""
                  }
                />
              </div>
            )}
          </div>

          <div className="max-h-46 overflow-auto">
            {filteredOptions.map((option, index) => {
              return (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-gray-100 p-1  truncate whitespace-nowrap overflow-ellipsis"
                  onClick={() => {
                    props.onSelect(option);
                    setShowOptions(false);
                  }}
                >
                  {option}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
