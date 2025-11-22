import { mdiDelete } from "@mdi/js";
import type { NumberCondition, Operator } from "./NumberFilter";
import Icon from "@mdi/react";
import { useCallback, useState } from "react";

interface NumberConditionProps {
  numberCondition: NumberCondition;
  isNew: boolean;
  immediatApply?: boolean;
  deleteCondition?: (condition: NumberCondition) => void;
  updateCondition: (condition: NumberCondition) => void;
}

function NumberConditionItem(props: Readonly<NumberConditionProps>) {
  const [value1, setValue1] = useState(props.numberCondition.value1);
  const [value2, setValue2] = useState(props.numberCondition.value2 ?? 0);

  const handleBlur = useCallback(
    (field: "value1" | "value2", value: number) => {
      props.updateCondition({
        id: props.numberCondition.id,
        operator: props.numberCondition.operator,
        value1: field === "value1" ? value : props.numberCondition.value1,
        value2: field === "value2" ? value : props.numberCondition.value2,
      });
    },
    [props.numberCondition.id, props.numberCondition.operator]
  );

  const handleDelete = (
    event: React.MouseEvent,
    condition: NumberCondition
  ) => {
    // Prevent event bubbling
    event?.preventDefault();
    event?.stopPropagation();

    if (props.deleteCondition) {
      props.deleteCondition(condition);
    }
  };

  return (
    <div
      key={props.numberCondition.id}
      className="flex items-center gap-1 group"
    >
      <select
        value={props.numberCondition.operator}
        onChange={(e) =>
          props.updateCondition({
            id: props.numberCondition.id,
            operator: e.target.value as Operator,
            value1: props.numberCondition.value1,
            value2: props.numberCondition.value2,
          })
        }
        className=" select select-xs px-1 grow"
      >
        <option value="=">Equal</option>
        <option value=">">Greater than</option>
        <option value="<">Less than</option>
        <option value=">=">{">="}</option>
        <option value="<=">{"<="}</option>
        <option value="between">Between</option>
      </select>

      <input
        type="number"
        value={value1}
        onChange={(e) => {
          setValue1(parseFloat(e.target.value) || 0);
          if (props.immediatApply) {
            handleBlur("value1", parseFloat(e.target.value) || 0);
          }
        }}
        onBlur={(e) => handleBlur("value1", parseFloat(e.target.value) || 0)}
        className="input input-xs w-12"
        step="any"
      />

      {props.numberCondition.operator === "between" && (
        <>
          <span className="text-xs font-semibold">-</span>
          <input
            type="number"
            value={value2}
            onChange={(e) => {
              setValue2(parseFloat(e.target.value));
              if (props.immediatApply) {
                handleBlur("value2", parseFloat(e.target.value));
              }
            }}
            onBlur={(e) => handleBlur("value2", parseFloat(e.target.value))}
            className="input input-xs w-12"
            step="any"
          />
        </>
      )}
      {props.isNew ? (
        <></>
      ) : (
        <button
          onClick={(event) => handleDelete(event, props.numberCondition)}
          className="rounded bg-gray-200 p-0.5 cursor-pointer hover:bg-gray-300"
        >
          <Icon path={mdiDelete} color={"#d11f1f"} size={0.7} />
        </button>
      )}
    </div>
  );
}

export default NumberConditionItem;
