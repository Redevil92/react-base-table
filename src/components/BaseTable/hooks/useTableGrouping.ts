// src/components/BaseTable/hooks/useTableGrouping.ts
import { useCallback, useMemo, useState } from "react";
import TableItem from "../models/TableItem";
import ItemWithGroupInfo from "../models/ItemWithGroupInfo";
import GroupInfo from "../models/GroupInfo";

interface GroupedItems {
  [key: string]: { rowIndex: number; item: TableItem }[];
}

interface LinkedGroup {
  master: string;
  linked: string[];
}

interface UseTableGroupingReturn {
  groupedItems: GroupedItems;
  groupedItemsEntries: [string, { rowIndex: number; item: TableItem }[]][];
  collapsedGroups: string[];
  flatGroupedItemsToDisplay: Array<GroupInfo | ItemWithGroupInfo>;
  onCollapseGroup: (group: string) => void;
  setCollapsedGroup: (groupNames: string[]) => void;
  isGroupLinked: (groupName: string) => boolean;
}

export default function useTableGrouping(
  filteredItems: TableItem[],
  groupBy?: string,
  linkedGroups?: LinkedGroup[]
): UseTableGroupingReturn {
  const [collapsedGroups, setCollapsedGroup] = useState<string[]>([]);

  const onCollapseGroup = useCallback((group: string) => {
    setCollapsedGroup((prevGroups) => {
      const isCollapsed = prevGroups.includes(group);

      const newCollapsedGroups = isCollapsed
        ? prevGroups.filter((g) => g !== group) // Uncollapse
        : [...prevGroups, group]; // Collapse

      return newCollapsedGroups;
    });
  }, []);

  // Group items by the groupBy property
  const groupedItems = useMemo(() => {
    if (!groupBy) {
      // If no grouping is requested, return items in a format that mimics grouped structure
      // but with a single empty group key
      const ungroupedItems = filteredItems.map((item, index) => ({
        rowIndex: index,
        item,
      }));
      return { "": ungroupedItems } as GroupedItems;
    }

    // First pass: group items by the groupBy property
    const grouped = filteredItems.reduce((acc, item) => {
      const key = item[groupBy] as string | number;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ rowIndex: 0, item });
      return acc;
    }, {} as GroupedItems);

    // Second pass: assign proper row indices for each item in each group
    let flatIndex = 0;
    const groupedWithIndexes: GroupedItems = {};

    Object.keys(grouped).forEach((key) => {
      groupedWithIndexes[key] = grouped[key].map(({ item }) => {
        return { rowIndex: flatIndex++, item };
      });
    });

    return groupedWithIndexes;
  }, [filteredItems, groupBy]);

  const groupedItemsEntries = useMemo(() => {
    const entries = Object.entries(groupedItems);

    // If no linked groups, return entries as is
    if (!linkedGroups || linkedGroups.length === 0) {
      return entries;
    }

    // Create efficient lookup structures
    const masterGroups = new Set(linkedGroups.map((group) => group.master));
    const linkedGroupsSet = new Set(
      linkedGroups.flatMap((group) => group.linked)
    );
    const masterToLinkedMap = new Map(
      linkedGroups.map((group) => [group.master, group.linked])
    );

    // Track processed groups to avoid duplicates
    const processedGroups = new Set<string>();

    // Final ordered entries
    const orderedEntries: [string, { rowIndex: number; item: TableItem }[]][] =
      [];

    // Create map for quick lookup of entries by group name
    const entriesByName = new Map(entries.map((entry) => [entry[0], entry]));

    // Process all entries in original order
    for (const [groupName, groupItems] of entries) {
      // Skip if already processed
      if (processedGroups.has(groupName)) continue;

      // Case 1: This is a master group - add it and its linked groups
      if (masterGroups.has(groupName)) {
        // Add the master group
        orderedEntries.push([groupName, groupItems]);
        processedGroups.add(groupName);

        // Add all linked groups immediately after
        const linkedGroups = masterToLinkedMap.get(groupName) || [];
        for (const linkedGroup of linkedGroups) {
          const linkedEntry = entriesByName.get(linkedGroup);
          if (linkedEntry && !processedGroups.has(linkedGroup)) {
            orderedEntries.push(linkedEntry);
            processedGroups.add(linkedGroup);
          }
        }
      }
      // Case 2: This is a linked group - skip (will be added with its master)
      else if (linkedGroupsSet.has(groupName)) {
        continue;
      }
      // Case 3: Regular group - add it
      else {
        orderedEntries.push([groupName, groupItems]);
        processedGroups.add(groupName);
      }
    }

    // Update row indices to match display order
    let flatIndex = 0;
    return orderedEntries.map(([groupName, groupItems]) => {
      const updatedItems = groupItems.map(({ item }) => {
        return { rowIndex: flatIndex++, item };
      });
      return [groupName, updatedItems] as [
        string,
        { rowIndex: number; item: TableItem }[],
      ];
    });
  }, [groupedItems, linkedGroups]);

  const flatGroupedItemsToDisplay = useMemo(() => {
    const result: Array<GroupInfo | ItemWithGroupInfo> = [];

    groupedItemsEntries.forEach(([groupName, items]) => {
      // Add group header
      const isCollapsed = collapsedGroups?.includes(groupName) ?? false;
      result.push({ isGroup: true, groupName, isCollapsed });

      // Add items only if group is not collapsed
      if (!isCollapsed) {
        items.forEach(({ rowIndex, item }) => {
          result.push({
            isGroup: false,
            rowIndex,
            groupName,
            isCollapsed: isCollapsed,
            item,
          });
        });
      }
    });

    return result;
  }, [groupedItemsEntries, collapsedGroups]);

  // Helper function to check if a group is linked
  const isGroupLinked = useMemo(() => {
    return (groupName: string): boolean => {
      return !!linkedGroups?.some((group) => group.linked.includes(groupName));
    };
  }, [linkedGroups]);

  return {
    groupedItems,
    groupedItemsEntries,
    collapsedGroups,
    flatGroupedItemsToDisplay,
    onCollapseGroup,
    setCollapsedGroup,
    isGroupLinked,
  };
}
