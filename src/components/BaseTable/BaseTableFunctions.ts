import { isNumberArray } from "../../utils/array";
import { alphabeticalSort, alphabeticalSortInverse } from "../../utils/sorting";
import ActiveTableFilter from "./models/ActiveTableFilter";
import BaseTableHeader from "./models/BaseTableHeaders";
import TableItem from "./models/TableItem";

export const NBSP = "\u00A0";

export const filterItems = (
  items: TableItem[],
  filters: ActiveTableFilter[]
): TableItem[] => {
  if (items.length === 0) return [];
  if (filters.length === 0) return [...items];

  return [...items].filter((item: TableItem) => {
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
      } else if (
        (filter.itemsToHide as string[]).includes(itemToCheck as string)
      ) {
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
  if (!sortBy) return items;

  const header = headers.find((item) => item.id === sortBy);

  if (header?.customSort) {
    items.sort((a: TableItem, b: TableItem) =>
      header.customSort!(a, b, currentSortType === "asc")
    );
    return items;
  }

  let isNumberColumn = true;
  items.forEach((item) => {
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
    items.sort((a: TableItem, b: TableItem) => {
      const aToNumber = tryToConvertToNumber(a[sortBy] as string);
      const bToNumber = tryToConvertToNumber(b[sortBy] as string);

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
    return items;
  }

  // alphabetical sort
  if (currentSortType === "desc") {
    items.sort((a: TableItem, b: TableItem) =>
      alphabeticalSort(b[sortBy] as string, a[sortBy] as string)
    );
  } else {
    items.sort((a: TableItem, b: TableItem) =>
      alphabeticalSortInverse(b[sortBy] as string, a[sortBy] as string)
    );
  }

  return [...items];
};

export const tryToConvertToNumber = (item: string) => {
  if (typeof item === "number") return item;
  if (typeof item === "string") {
    return Number(item.split(NBSP).join(""));
  }
  return item;
};
