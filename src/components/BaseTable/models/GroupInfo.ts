export default interface GroupInfo {
  isGroup: boolean;
  groupName: string;
  isCollapsed?: boolean;
  masterGroupName?: string; // Optional prop to indicate if this group is linked
  linkedGroupNames?: string[]; // Optional prop to hold names of linked groups
}
