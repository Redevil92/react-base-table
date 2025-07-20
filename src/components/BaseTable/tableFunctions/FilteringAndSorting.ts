import { isNumberArray } from "../../../utils/array";
import {
  alphabeticalSort,
  alphabeticalSortInverse,
} from "../../../utils/sorting";
import ActiveTableFilter from "../models/ActiveTableFilter";
import BaseTableHeader from "../models/BaseTableHeaders";
import TableItem from "../models/TableItem";

export const NBSP = "\u00A0";

export const filterItems = (
  items: TableItem[],
  filters: ActiveTableFilter[]
): TableItem[] => {
  if (items.length === 0) return [];
  if (filters.length === 0) return [...items];

  return [...items].filter((item: any) => {
    for (const filter of filters) {
      let itemToCheck: string | number | boolean = item[filter.headerId];
      let shouldHide = false;

      //   if (isArrayOfType(filter.itemsToHide, "boolean")) {
      //     shouldHide = (filter.itemsToHide as boolean[]).includes(
      //       itemToCheck as boolean
      //     );
      //   } else
      if (isNumberArray(filter.itemsToHide)) {
        itemToCheck =
          typeof itemToCheck === "string"
            ? itemToCheck.split(NBSP).join("")
            : itemToCheck;
        shouldHide = filter.itemsToHide.includes(Number(itemToCheck));
      } else if ((filter.itemsToHide as any[]).includes(itemToCheck)) {
        shouldHide = true;
      }
      // If ANY filter would hide this item, filter it out
      if (shouldHide) {
        return false;
      }
    }
    return true;
  });
};

export const sortItems = (
  items: TableItem[],
  headers: BaseTableHeader[],
  currentSortType: "asc" | "desc",
  sortBy: string | undefined
): TableItem[] => {
  let itemsCopy = [...items];

  if (!sortBy) return itemsCopy;

  const header = headers.find((item) => item.id === sortBy);

  if (header?.customSort) {
    itemsCopy.sort((a: TableItem, b: TableItem) =>
      header.customSort!(a, b, currentSortType === "asc")
    );
    return itemsCopy;
  }

  let isNumberColumn = true;
  itemsCopy.forEach((item) => {
    const currentItem = item[sortBy]?.toString();
    if (!currentItem) {
      return;
    }

    const itemToNumber = tryToConvertToNumber(currentItem);
    const toExcludeFromNumberCheck = ["NaN"];

    if (
      isNaN(itemToNumber) &&
      !toExcludeFromNumberCheck.includes(currentItem)
    ) {
      isNumberColumn = false;
    }
  });

  // number sort
  if (isNumberColumn) {
    itemsCopy.sort((a: any, b: any) => {
      const aToNumber = tryToConvertToNumber(a[sortBy]);
      const bToNumber = tryToConvertToNumber(b[sortBy]);

      const aIsNumber = typeof aToNumber === "number" && !isNaN(aToNumber);
      const bIsNumber = typeof bToNumber === "number" && !isNaN(bToNumber);

      // Put non-numbers at the end
      if (aIsNumber && !bIsNumber) {
        return -1;
      }
      if (!aIsNumber && bIsNumber) {
        return 1;
      }

      return currentSortType === "desc"
        ? bToNumber - aToNumber
        : aToNumber - bToNumber;
    });
    return itemsCopy;
  }

  // alphabetical sort
  if (currentSortType === "desc") {
    itemsCopy.sort((a: any, b: any) =>
      alphabeticalSort(b[sortBy] as string, a[sortBy] as string)
    );
  } else {
    itemsCopy.sort((a: any, b: any) =>
      alphabeticalSortInverse(b[sortBy] as string, a[sortBy] as string)
    );
  }

  return itemsCopy;
};

export const tryToConvertToNumber = (item: any) => {
  if (typeof item === "number") return item;
  if (typeof item === "string") {
    return Number(item.split(NBSP).join(""));
  }
  return item;
};
