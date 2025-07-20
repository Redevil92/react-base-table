import CellCoordinate from "../models/CellCordinate";

type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

const calculateSelectedCellAndExpandedSelection = (
  e: React.KeyboardEvent,
  selectedCell: CellCoordinate | undefined,
  expandedSelection: CellCoordinate[],
  columnsCount: number,
  rowsCount: number
) => {
  e.stopPropagation();
  console.log("Here", e.key);

  let newSelectedCell: CellCoordinate | undefined = selectedCell;
  let newExpandedSelection: CellCoordinate[] = [...expandedSelection];

  // Tab navigation
  if (e.key === "Tab") {
    console.log("Tab");
    let nextRow = selectedCell?.rowIndex ?? 0;
    let nextCol = selectedCell?.columnIndex ?? 0;

    // If there's an expanded selection, navigate within it.
    if (expandedSelection.length > 1) {
      // Check for length > 1 to ensure it's truly expanded
      // Determine the min/max rows and columns of the current expanded selection
      const minRow = Math.min(...expandedSelection.map((c) => c.rowIndex));
      const maxRow = Math.max(...expandedSelection.map((c) => c.rowIndex));
      const minCol = Math.min(...expandedSelection.map((c) => c.columnIndex));
      const maxCol = Math.max(...expandedSelection.map((c) => c.columnIndex));

      if (e.shiftKey) {
        // Shift + Tab (move left/up)
        nextCol--;
        if (nextCol < minCol) {
          // If moved past the left edge of the selection
          nextCol = maxCol; // Wrap to the rightmost column of the current selection
          nextRow--; // Move up one row
          if (nextRow < minRow) {
            // If moved past the top edge of the selection
            nextRow = maxRow; // Wrap to the bottommost row of the current selection
          }
        }
      } else {
        // Tab (move right/down)
        nextCol++;
        if (nextCol > maxCol) {
          // If moved past the right edge of the selection
          nextCol = minCol; // Wrap to the leftmost column of the current selection
          nextRow++; // Move down one row
          if (nextRow > maxRow) {
            // If moved past the bottom edge of the selection
            nextRow = minRow; // Wrap to the topmost row of the current selection
          }
        }
      }
    } else {
      // No expanded selection, revert to existing table-wide navigation
      nextCol = (selectedCell?.columnIndex ?? 0) + (e.shiftKey ? -1 : 1);

      if (nextCol >= columnsCount) {
        nextCol = 0;
        nextRow++;
      } else if (nextCol < 0) {
        nextCol = columnsCount - 1;
        nextRow--;
      }

      if (nextRow >= rowsCount) {
        nextRow = 0;
      }
      if (nextRow < 0) {
        nextRow = rowsCount - 1;
      }

      newExpandedSelection = [];
    }

    // Ensure newSelectedCell is within valid bounds (if you have them, e.g., for columnsCount, rowsCount)
    // These checks might already be implicitly handled by your wrap-around, but good to ensure
    newSelectedCell = { rowIndex: nextRow, columnIndex: nextCol };
  }

  if (
    e.shiftKey &&
    ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    // Arrow navigation with shift (expand selection)
    newExpandedSelection = expandSelectionWithArrow(
      selectedCell,
      expandedSelection,
      e.key as ArrowKey
    );
  }

  // Arrow navigation without shift (move selection)
  if (
    !e.shiftKey &&
    ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    let nextRow = selectedCell?.rowIndex ?? 0;
    let nextCol = selectedCell?.columnIndex ?? 0;

    switch (e.key) {
      case "ArrowDown":
        nextRow = Math.min(rowsCount - 1, nextRow + 1);
        break;
      case "ArrowUp":
        nextRow = Math.max(0, nextRow - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min(columnsCount - 1, nextCol + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, nextCol - 1);
        break;
    }

    newSelectedCell = { rowIndex: nextRow, columnIndex: nextCol };
    newExpandedSelection = [];
  }

  return {
    newSelectedCell,
    newExpandedSelection,
  };
};

function expandSelectionWithArrow(
  selectedCell: CellCoordinate | undefined,
  expandedSelection: CellCoordinate[],
  arrowKey: ArrowKey
): CellCoordinate[] {
  if (!selectedCell) {
    return expandedSelection;
  }

  // Determine the current min/max row/column of the expanded selection.
  // This helps identify the 'active' corner or edge of the selection that moves.
  let currentMinRow: number;
  let currentMaxRow: number;
  let currentMinCol: number;
  let currentMaxCol: number;

  if (expandedSelection.length === 0) {
    // If selection is empty, it starts with the selected cell itself.
    return [{ ...selectedCell }];
  } else {
    currentMinRow = Math.min(...expandedSelection.map((c) => c.rowIndex));
    currentMaxRow = Math.max(...expandedSelection.map((c) => c.rowIndex));
    currentMinCol = Math.min(...expandedSelection.map((c) => c.columnIndex));
    currentMaxCol = Math.max(...expandedSelection.map((c) => c.columnIndex));
  }

  // The 'active' coordinate is the one *opposite* to the selectedCell's coordinate
  // in the direction of the current selection. This is the coordinate that moves.
  let activeRow = 0;
  let activeCol = 0;

  // Determine the 'active' corner of the current selection relative to the anchor
  if (selectedCell.rowIndex === currentMinRow) {
    activeRow = currentMaxRow; // Anchor is top, active is bottom
  } else {
    activeRow = currentMinRow; // Anchor is bottom, active is top
  }

  if (selectedCell.columnIndex === currentMinCol) {
    activeCol = currentMaxCol; // Anchor is left, active is right
  } else {
    activeCol = currentMinCol; // Anchor is right, active is left
  }

  // Now, adjust the active coordinate based on the arrow key press.
  switch (arrowKey) {
    case "ArrowUp":
      activeRow = activeRow - 1;
      break;
    case "ArrowDown":
      activeRow = activeRow + 1;
      break;
    case "ArrowLeft":
      activeCol = activeCol - 1;
      break;
    case "ArrowRight":
      activeCol = activeCol + 1;
      break;
    default:
      return expandedSelection;
  }

  // The new selection rectangle is always defined by the selectedCell
  // and the new 'active' coordinate.
  const finalMinRow = Math.min(selectedCell.rowIndex, activeRow);
  const finalMaxRow = Math.max(selectedCell.rowIndex, activeRow);
  const finalMinCol = Math.min(selectedCell.columnIndex, activeCol);
  const finalMaxCol = Math.max(selectedCell.columnIndex, activeCol);

  const newSelection: CellCoordinate[] = [];
  for (let r = finalMinRow; r <= finalMaxRow; r++) {
    for (let c = finalMinCol; c <= finalMaxCol; c++) {
      newSelection.push({ rowIndex: r, columnIndex: c });
    }
  }

  return newSelection;
}

export default calculateSelectedCellAndExpandedSelection;
