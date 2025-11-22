import type { NumberCondition } from "../tableFilter/filterImplementations/NumberFilter/NumberFilter";

export default interface ActiveTableFilter {
  headerId: string;
  itemsToHide: string[] | number[];
  numberConditions?: NumberCondition[];
}

