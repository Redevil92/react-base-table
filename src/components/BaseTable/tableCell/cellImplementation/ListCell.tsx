import { useEffect, useMemo, useRef, useState } from "react";

import { useTableInteractionContext } from "../../contexts/useTableInteractionContext";
import type BaseTableHeader from "../../models/BaseTableHeaders";
import OptionList from "./OptionList";
import { useAdvancedSettings } from "../../../../stores/tableDataStore";
import { useScrollRef } from "../../../../stores/tableRefStore";

interface ListCellProps {
  // Define your props here
  inputRef: React.Ref<HTMLInputElement> | null;
  header: BaseTableHeader;
  value?: string;
  options: string[];
  onSelect: (value: string) => void;
  onEnter: (value: string) => void;
  //addOption?: (newOption: string) => void;
  disabled?: boolean;
  hideOptions?: boolean;
}

export default function ListCell(props: Readonly<ListCellProps>) {
  const [showOptions, setShowOptions] = useState(false);
  const [localInput, setLocalInput] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<
    number | undefined
  >();

  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const advancedSettings = useAdvancedSettings();
  const { addListOption } = useTableInteractionContext();

  const filteredOptions = useMemo(() => {
    const result = [];

    result.push({ value: "", toAdd: false });

    if (
      localInput &&
      advancedSettings?.canAddListOptions &&
      props.header.editOptions?.canAddNewOption !== false &&
      !props.options.some(
        (opt) => opt.toLowerCase() === localInput.toLowerCase()
      )
    ) {
      result.push({
        value: localInput,
        toAdd: true,
      });
    }

    let matchingOptions = [];

    if (localInput === "" || props.options.includes(localInput)) {
      matchingOptions = props.options.map((option) => ({
        value: option,
        toAdd: false,
      }));
    } else {
      matchingOptions = props.options
        .filter(
          (option) =>
            localInput === "" ||
            props.options.includes(localInput) ||
            option.toLowerCase().includes(localInput.toLowerCase())
        )
        .map((option) => ({
          value: option,
          toAdd: false,
        }));
    }

    // Add filtered options to result
    result.push(...matchingOptions);

    return result;
  }, [props.options, localInput, advancedSettings?.canAddListOptions]);

  useEffect(() => {
    setLocalInput(props.value || "");
  }, [props.value]);

  useEffect(() => {
    //setSelectedOptionIndex(undefined);
  }, [filteredOptions]);

  useEffect(() => {
    if (
      showOptions &&
      selectedOptionIndex !== undefined &&
      optionsContainerRef.current
    ) {
      const container = optionsContainerRef.current;
      const selectedOption = container.children[
        selectedOptionIndex
      ] as HTMLElement;

      if (selectedOption) {
        // Calculate if the option is out of view
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const elementTop = selectedOption.offsetTop;
        const elementBottom = elementTop + selectedOption.offsetHeight;

        // Scroll into view if needed
        if (elementTop < containerTop) {
          // Option is above the visible area
          container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
          // Option is below the visible area
          container.scrollTop = elementBottom - container.clientHeight;
        }
      }
    }
  }, [selectedOptionIndex, showOptions]);

  const selectOptionHandler = async (
    option: string,
    isOptionToAdd?: boolean
  ) => {
    if (isOptionToAdd) {
      await addListOption(option, props.header);
    }

    props.onSelect(option);
    setShowOptions(false);
  };

  const onEnterHandler = async (option: string, isOptionToAdd?: boolean) => {
    if (isOptionToAdd) {
      await addListOption(option, props.header);
    }

    props.onEnter(option);
    setShowOptions(false);
  };

  const handleKeyDownForListCell = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setShowOptions(true);

      if (filteredOptions.length > 0) {
        let newSelectedOptionIndex: number | undefined =
          (selectedOptionIndex ?? -1) + (e.key === "ArrowDown" ? 1 : -1);

        if (newSelectedOptionIndex < 0) {
          newSelectedOptionIndex = filteredOptions.length - 1;
        } else if (newSelectedOptionIndex >= filteredOptions.length) {
          newSelectedOptionIndex = 0;
        }
        setSelectedOptionIndex(newSelectedOptionIndex);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (showOptions && selectedOptionIndex !== undefined) {
        await onEnterHandler(
          filteredOptions[selectedOptionIndex].value,
          filteredOptions[selectedOptionIndex].toAdd &&
            advancedSettings?.canAddListOptions
        );
      } else {
        if (localInput && [...props.options, ""].includes(localInput)) {
          await onEnterHandler(localInput, false);
        } else {
          console.log("Input does not match any option");
        }
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", // 8px padding
    // height: cellSize.height ? `${cellSize.height - 10}px` : "calc(100% - 8px)", // 8px padding
    // boxSizing: "border-box" as React.CSSProperties["boxSizing"],
    outline: "none",
    border: "none",
    background: "transparent",
  };

  const onChangeInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value);
    setShowOptions(true);
  };

  const cellRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useScrollRef();

  const [dropdownPosition, setDropdownPosition] = useState({
    left: "-8px",
    top: "23px",
  });

  useEffect(() => {
    setDropdownPositionHandler();
  }, [showOptions, scrollRef]);

  const setDropdownPositionHandler = () => {
    if (
      showOptions &&
      cellRef.current &&
      dropdownRef.current &&
      scrollRef.current
    ) {
      const cellRect = cellRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const scrollReact = scrollRef.current.getBoundingClientRect();

      const cellRelativeLeft = cellRect.left - scrollReact.left;
      const cellRelativeTop = cellRect.top - scrollReact.top;

      const wouldOverflowRight =
        cellRelativeLeft + dropdownRect.width > scrollRef.current.clientWidth;
      const wouldOverflowBottom =
        cellRelativeTop + dropdownRect.height > scrollRef.current.clientHeight;

      const newPosition = {
        left: wouldOverflowRight
          ? `${-dropdownRect.width + cellRect.width}px`
          : "-8px",
        top: wouldOverflowBottom ? `${-dropdownRect.height}px` : "23px",
      };

      setDropdownPosition(newPosition);
    }
  };

  return (
    <div className="relative " ref={cellRef}>
      <div
        className="flex justify-between min-h-4"
        onClick={() => {
          setShowOptions(!showOptions);
        }}
      >
        {/* <div className=" truncate whitespace-nowrap overflow-ellipsis">
          {props.value}
        </div> */}
        <input
          ref={props.inputRef}
          type="text"
          value={localInput}
          onChange={onChangeInputHandler}
          onKeyDown={handleKeyDownForListCell}
          required
          style={inputStyle}
        />

        <button
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
          ref={dropdownRef}
          className="absolute bg-base-100 border border-[var(--border-color)]  z-300 w-52 p-1  shadow-sm"
          style={{
            left: dropdownPosition.left,
            top: dropdownPosition.top,
          }}
        >
          <div ref={optionsContainerRef} className="max-h-46 overflow-auto">
            {filteredOptions.map((option, index) => {
              return (
                <OptionList
                  optionKey={index + "-" + option}
                  onClick={(value, isOptionToAdd) => {
                    selectOptionHandler(value, isOptionToAdd);
                  }}
                  isOptionToAdd={
                    advancedSettings?.canAddListOptions && option.toAdd === true
                  }
                  value={option.value}
                  text={option.value === "" ? "<Empty>" : option.value}
                  italic={option.value === ""}
                  isSelected={selectedOptionIndex === index}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
