import { useEffect } from "react";
import BaseTable, { type BaseTableProps } from "./BaseTable";
import { TableInteractionProvider } from "./contexts/useTableInteractionContext";
import type TableItem from "./models/TableItem";
import {
  useActiveFilters,
  useAscendingOrder,
  useCurrentSortId,
  useHiddenHeadersId,
  useTableDataActions,
} from "../../stores/tableDataStore";
import useTableGrouping from "./hooks/useTableGrouping";

export default function BaseTableWithContext<T extends TableItem>(
  props: Readonly<BaseTableProps<T>>
) {
  const activeFilters = useActiveFilters();
  const currentSortId = useCurrentSortId();
  const ascendingOrder = useAscendingOrder();
  const hiddenHeadersId = useHiddenHeadersId();
  const {
    setItems,
    processItems,
    setHeaders,
    processFilterItemsCache,
    // setCurrentSortId,
    setGroupBy,
    setLinkedGroups,
    setHighlightConditions,
    setComments,
    setAdvancedSettings,
    processHeaders,
  } = useTableDataActions();

  // we might need some improvements here, split filtering and sorting in the processItems
  // and have two useEffects based on what changes
  useEffect(() => {
    setItems(props.items);
    processItems();
    processFilterItemsCache();
  }, [
    props.items,
    props.headers,
    currentSortId,
    ascendingOrder,
    activeFilters,
  ]);

  // useEffect(() => {
  //   setHeaders(props.headers);
  // }, [props.headers]);

  useEffect(() => {
    setHeaders(props.headers);
    processHeaders();
  }, [props.headers, hiddenHeadersId]);

  useEffect(() => {
    setComments(props.comments || []);
  }, [props.comments]);

  useEffect(() => {
    setHighlightConditions(props.highlightCondition || []);
  }, [props.highlightCondition]);

  // useEffect(() => {
  //   setCurrentSortId(props.currentSortId);
  // }, [props.currentSortId]);

  useEffect(() => {
    setGroupBy(props.groupBy);
  }, [props.groupBy]);

  useEffect(() => {
    setAdvancedSettings(props.advancedSettings);
  }, [props.advancedSettings]);

  useEffect(() => {
    setLinkedGroups(props.linkedGroups);
  }, [props.linkedGroups]);

  const { groupedItemsEntries } = useTableGrouping();

  return (
    <TableInteractionProvider
      groupedItemsEntries={props.groupBy ? groupedItemsEntries : undefined}
      onChange={props.onChange}
      onBulkChange={props.onBulkChange}
      onRowDoubleClick={props.onRowDoubleClick}
      onRowsReordered={props.onRowsReordered}
      onDeleteComment={props.onDeleteComment}
      onSaveComment={props.onSaveComment}
      onSetHighlightCondition={props.onSetHighlightCondition}
      onRemoveHighlightCondition={props.onRemoveHighlightCondition}
      onAddListOption={props.onAddListOption}
    >
      <BaseTable {...props}></BaseTable>
    </TableInteractionProvider>
  );
}

