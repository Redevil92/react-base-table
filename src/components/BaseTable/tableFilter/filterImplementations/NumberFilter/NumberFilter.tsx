import { useCallback, useEffect, useMemo, useState } from "react";
import BaseButton from "../../../../BaseButton";
import NumberConditionItem from "./NumberConditionItem";
import { mdiPlus } from "@mdi/js";
import {
  useActiveFilters,
  useTableDataActions,
} from "../../../../../stores/tableDataStore";
import { FilterTypes } from "../../../../../enum/FilterTypes";

interface NumberFilterProps {
  headerId: string;
  filterType: FilterTypes;
  items: string[] | number[];
  onShowOrHide: (show: boolean) => void;
}

export type Operator = "=" | ">" | "<" | ">=" | "<=" | "between";

export interface NumberCondition {
  id: string;
  operator: Operator;
  value1: number;
  value2?: number;
}

function NumberFilter(props: Readonly<NumberFilterProps>) {
  const { setActiveFilter } = useTableDataActions();
  const activeFilters = useActiveFilters();

  const currentActiveFilter = useMemo(() => {
    return activeFilters.find((filter) => filter.headerId === props.headerId);
  }, [activeFilters, props.headerId]);

  const [conditions, setConditions] = useState<NumberCondition[]>([]);

  useEffect(() => {
    if (currentActiveFilter?.numberConditions) {
      setConditions(currentActiveFilter?.numberConditions);
    }
  }, [currentActiveFilter]);

  useEffect(() => {
    applyFilter();
  }, [conditions]);

  const [conditionToAdd, setConditionToAdd] = useState<NumberCondition>({
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    operator: "=",
    value1: 0,
  });

  const numericItems = useMemo(
    () =>
      props.items
        .map((item) => (typeof item === "string" ? parseFloat(item) : item))
        .filter((item): item is number => !isNaN(item)),
    [props.items]
  );

  const applyFilter = useCallback(() => {
    const itemsToHide = props.items.filter((_item, index) => {
      const num = numericItems[index];
      if (typeof num !== "number") return true;

      // Item is hidden if it fails ANY condition
      return conditions.some((condition) => {
        switch (condition.operator) {
          case "=":
            return num !== condition.value1;
          case ">":
            return num <= condition.value1;
          case "<":
            return num >= condition.value1;
          case ">=":
            return num < condition.value1;
          case "<=":
            return num > condition.value1;
          case "between":
            return condition.value2 === undefined
              ? true
              : num < condition.value1 || num > condition.value2;
        }
      });
    });

    if (props.items.length > 0 && typeof props.items[0] === "string") {
      setActiveFilter(props.headerId, itemsToHide as string[], conditions);
    } else {
      setActiveFilter(props.headerId, itemsToHide as number[], conditions);
    }
  }, [props.items, props.headerId, conditions, numericItems, setActiveFilter]);

  const addCondition = (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setConditions((prev) => [...prev, conditionToAdd]);
    setConditionToAdd({
      id: Date.now().toString(),
      operator: "=",
      value1: 0,
    });
  };

  const updateCondition = (id: string, updates: Partial<NumberCondition>) => {
    setConditions((prev) =>
      prev.map((condition) =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
  };

  const removeCondition = (id: string) => {
    const newConditions = conditions.filter((condition) => condition.id !== id);
    setConditions(newConditions);
  };

  const clearFilter = () => {
    setConditions([]);
    setActiveFilter(props.headerId, [], []);
  };

  return (
    <form onSubmit={addCondition} className="space-y-4">
      <div className="bg-blue-50/70 p-2 rounded-md">
        <NumberConditionItem
          numberCondition={conditionToAdd}
          updateCondition={(updatedCondition) =>
            setConditionToAdd(updatedCondition)
          }
          isNew={true}
          immediatApply={true}
        />
        <div className="flex items-center gap-2 mt-2">
          <BaseButton
            text="Add Condition"
            type="button"
            onClick={addCondition}
            small
            className="rounded-lg p-2 py-0"
            icon={mdiPlus}
            iconColor="var(--comment-color)"
            iconSize={0.7}
          />
        </div>
      </div>

      <div className="mt-4">
        {currentActiveFilter?.numberConditions?.map((condition, index) => (
          <div className="mb-1" key={"condition-" + index}>
            <NumberConditionItem
              numberCondition={condition}
              updateCondition={(updatedCondition) =>
                updateCondition(updatedCondition.id, updatedCondition)
              }
              deleteCondition={() => removeCondition(condition.id)}
              isNew={false}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-8">
        <BaseButton
          text="Clear filter"
          disabled={
            !currentActiveFilter?.numberConditions ||
            currentActiveFilter?.numberConditions?.length === 0
          }
          onClick={clearFilter}
          small
        />
      </div>
    </form>
  );
}

export default NumberFilter;
