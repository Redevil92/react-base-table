interface ListCellProps {
  // Define your props here
  onClick: (option: string, isOptionToAdd?: boolean) => void;
  value: string;
  text: string;
  isSelected: boolean;
  italic?: boolean;
  optionKey: string;
  isOptionToAdd?: boolean;
}

export default function OptionList(props: Readonly<ListCellProps>) {
  return (
    <div key={props.optionKey} className="flex">
      <button
        key={"0-empty-option"}
        className={`px-2 cursor-pointer grow-1 text-left hover:bg-gray-100 p-1  truncate whitespace-nowrap overflow-ellipsis ${
          props.italic ? "italic text-gray-400" : ""
        }  ${
          props.isSelected ? "bg-[var(--primary-color_background)] rounded" : ""
        }`}
        onClick={() => props.onClick(props.value, props.isOptionToAdd)}
      >
        {props.isOptionToAdd && <strong>Add </strong>}
        {props.text}
      </button>
    </div>
  );
}

