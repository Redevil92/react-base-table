export const getCellId = (
  rowIndex: number,
  columnIndex: number,
  fromArrayData?: { index: number }
) => {
  return `cell-${rowIndex}-${columnIndex}${
    fromArrayData ? `-fromArray-${fromArrayData.index}` : ""
  }`;
};
