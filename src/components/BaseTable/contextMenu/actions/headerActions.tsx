import { mdiSort, mdiTableLargePlus, mdiTableLarge } from "@mdi/js";

import type ContextMenuAction from "../../models/ContextMenuAction";
import type BaseTableHeader from "../../models/BaseTableHeaders";
import ColumnsDialog from "../../dialogs/columnsDialog/ColumnsDialog";
import { useDialogsActions } from "../../../../stores/dialogsStore";
import { useTableDataActions } from "../../../../stores/tableDataStore";

export function useHeaderActions() {
  const dialogActions = useDialogsActions();
  const tableDataActions = useTableDataActions();

  const getHeaderActions = (
    header: BaseTableHeader,
    onSortClick: (header: BaseTableHeader) => void,
    _onResizeClick: (header: BaseTableHeader) => void,
    _onFilterClick: (header: BaseTableHeader) => void
  ): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];

    // Add sort action if sortable
    if (header.sortable) {
      actions.push({
        icon: mdiSort,
        iconColor: "#444",
        text: "Sort",
        onClick: () => onSortClick(header),
      });
    }

    actions.push({
      icon: mdiTableLargePlus,
      iconColor: "var(--comment-color)",
      text: "Choose columns",
      onClick: (e) => {
        dialogActions.openDialog(
          {
            x: e.clientX || 100,
            y: e.clientY || 100,
          },
          "Choose Columns",
          <ColumnsDialog />
        );
      },
    });
    actions.push({
      icon: mdiTableLarge,
      iconColor: "#444",
      text: "Reset columns",
      onClick: () => {
        tableDataActions.setHiddenHeadersId([]);
      },
    });

    return actions;
  };

  return { getHeaderActions };
}
