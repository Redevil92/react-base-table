# @redevilkz/react-base-table

A simple and customizable React table component with support for sorting, filtering, and custom rendering.

## How to test the package in dev

Yalc emulates npm publish. I prefer it to npm link because it causes less issues.

```bash
npm i yalc -g
```

In your package:

```bash
yalc publish
```

In your main project:

```bash
yalc add @redevilkz/react-base-table
```

In your package, after a rebuild:

```bash
yalc push
```

When you change something in your library

```bash
npm run buildForNPM && yalc push
```

## Installation

Install the package via npm or yarn:

```bash
npm install @redevilkz/react-base-table
```

or

```bash
yarn add @redevilkz/react-base-table
```

## Usage

To use the table component, you need to import both the `BaseTable` component and its CSS file:

```javascript
import { BaseTable } from "@redevilkz/react-base-table";
import "@redevilkz/react-base-table/style.css";
```

### Basic Example

Here's how to render a simple table:

```javascript
const headers = [
  { id: "name", text: "Name", type: "string", sortable: true },
  { id: "age", text: "Age", type: "number", sortable: true },
];

const items = [
  { name: "John Doe", age: "30" },
  { name: "Jane Smith", age: "25" },
];

<BaseTable headers={headers} items={items}></BaseTable>;
```

## Props

The `BaseTable` component accepts the following props:

### `BaseTableProps`

| Prop                 | Type                                                             | Default | Description                                          |
| -------------------- | ---------------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `height`             | `string`                                                         | `auto`  | Sets the height of the table.                        |
| `headers`            | `BaseTableHeader[]`                                              | -       | Defines the headers of the table.                    |
| `items`              | `TableItem[]`                                                    | -       | Defines the data items to display in the table.      |
| `marginTop`          | `string`                                                         | `0`     | Sets the top margin for the table.                   |
| `noBorder`           | `boolean`                                                        | `false` | Removes the border around the table if `true`.       |
| `pinColumns`         | `boolean`                                                        | `false` | Pins the columns for horizontal scrolling if `true`. |
| `alignCenterInLine`  | `boolean`                                                        | `false` | Aligns content centrally within rows if `true`.      |
| `currentSortId`      | `string`                                                         | -       | Sets the ID of the column currently being sorted.    |
| `highlightCondition` | `{ propertyId: string, value: unknown, style: CSSProperties }[]` | -       | Defines conditions for highlighting rows.            |
| `onResetSort`        | `() => void`                                                     | -       | Callback triggered to reset sorting.                 |
| `onRowDoubleClick`   | `(item: TableItem) => void`                                      | -       | Callback triggered when a row is double-clicked.     |
| `onSortByColumn`     | `(columnId: string) => void`                                     | -       | Callback triggered when sorting by a column.         |

## Header Definition

### `BaseTableHeader`

| Property       | Type                                                              | Description                                     |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `id`           | `string`                                                          | Unique identifier for the column.               |
| `text`         | `string`                                                          | The display text for the column header.         |
| `type`         | `'string', 'list', 'number'`                                      | The type of data in the column.                 |
| `customHeader` | `(header: BaseTableHeader) => ReactNode`                          | Custom rendering function for the header.       |
| `customRender` | `(item: TableItem, header: BaseTableHeader) => ReactNode`         | Custom rendering function for the cell content. |
| `sortable`     | `boolean`                                                         | Enables sorting for the column if `true`.       |
| `customSort`   | `(a: TableItem, b: TableItem, ascendingOrder: boolean) => number` | Custom sorting function for the column.         |
| `hasFilter`    | `boolean`                                                         | Enables filtering for the column if `true`.     |

## Data Items

### `TableItem`

A `TableItem` is an object where each key corresponds to a column ID defined in the `headers`.

Example:

```javascript
const item = {
  name: "John Doe",
  age: "30",
};
```

## Advanced Usage

### Highlighting Rows

You can highlight rows based on specific conditions using the `highlightCondition` prop:

```javascript
const highlightCondition = [
  {
    propertyId: "age",
    value: "30",
    style: { backgroundColor: "yellow" },
  },
];

<BaseTable
  headers={headers}
  items={items}
  highlightCondition={highlightCondition}
></BaseTable>;
```

### Custom Rendering

You can use the `customRender` function in `BaseTableHeader` to customize how a cell is displayed:

```javascript
const headers = [
  {
    id: "name",
    text: "Name",
    customRender: (item) => <strong>{item.name}</strong>,
  },
];
```

### Sorting Callback

Handle sorting logic with the `onSortByColumn` callback:

```javascript
const handleSort = (columnId) => {
  console.log(`Sorting by column: ${columnId}`);
};

<BaseTable
  headers={headers}
  items={items}
  onSortByColumn={handleSort}
></BaseTable>;
```

## License

This project is licensed under the [MIT License](LICENSE).
