// export const arrayMove = <T>(
//   array: Array<T>,
//   fromIndex: number,
//   toIndex: number
// ) => {
//   const element = array[fromIndex];
//   array.splice(fromIndex, 1);
//   array.splice(toIndex, 0, element);
// };

import type BaseTableHeader from "../components/BaseTable/models/BaseTableHeaders";

export const removeDuplicates = (arr: string[]): string[] => {
  return [...new Set(arr)];
};

export const isArrayOfType = <T>(array: any[], type: T): boolean => {
  return array.every((item) => typeof item === type);
};

export const isNumberArray = (array: any[]): array is number[] => {
  return array.every((item) => typeof item === "number");
};

export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [removed] = copy.splice(from, 1);
  copy.splice(to, 0, removed);
  return copy;
}

export function reorderAtLevel(
  nodes: BaseTableHeader[],
  parentId: string | null,
  fromIdx: number,
  toIdx: number
): BaseTableHeader[] {
  if (!parentId) {
    // Root level
    return arrayMove(nodes, fromIdx, toIdx);
  }
  return nodes.map((node) => {
    if (node.id === parentId && node.children) {
      return {
        ...node,
        children: arrayMove(node.children, fromIdx, toIdx),
      };
    }
    if (node.children) {
      return {
        ...node,
        children: reorderAtLevel(node.children, parentId, fromIdx, toIdx),
      };
    }
    return node;
  });
}
