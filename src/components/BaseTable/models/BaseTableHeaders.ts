import { ReactNode } from 'react';
import TableItem from './TableItem';

export default interface BaseTableHeader {
  id: string;
  text: string;
  type?: 'string' | 'list' | 'number';
  customHeader?: (header: BaseTableHeader) => ReactNode;
  customRender?: (item: TableItem, header: BaseTableHeader) => ReactNode;
  //editable?: boolean;
  sortable?: boolean;
  customSort?: (a: TableItem, b: TableItem, ascendingOrder: boolean) => number;
  hasFilter?: boolean;
}
