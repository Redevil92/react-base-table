# @redevilkz/react-base-table

A simple, customizable, and extensible React table component with support for sorting, filtering, grouping, row highlighting, custom rendering, drag-and-drop, and context menus.

---

## Features

- **Sorting**: Click column headers to sort data ascending/descending. Custom sort logic per column supported.
- **Filtering**: Enable per-column filtering for quick data search.
- **Grouping**: Group rows by any column, with collapsible group sections.
- **Row Highlighting**: Highlight rows based on custom conditions.
- **Custom Rendering**: Render custom content in headers and cells.
- **Drag & Drop**: Reorder rows with drag-and-drop (optional).
- **Context Menu**: Right-click on cells to open a customizable context menu.
- **Row Actions**: Double-click, right-click, and other row/cell interactions.
- **Responsive & Scrollable**: Pin columns, set table height, and enable horizontal scrolling.
- **Theming**: Easily style with Tailwind and DaisyUI classes.

---

## Installation

Install the package via npm or yarn:

```bash
npm install react-base-data-table
```

or

```bash
yarn add react-base-data-table
```

---

## Usage

Import the `BaseTable` component and its CSS:

```javascript
import { BaseTable } from "react-base-data-table";
import "react-base-data-table/style.css";
```

### Basic Example

```jsx
const headers = [
  { id: "name", text: "Name", type: "string", sortable: true },
  { id: "age", text: "Age", type: "number", sortable: true },
];

const items = [
  { name: "John Doe", age: "30" },
  { name: "Jane Smith", age: "25" },
];

<BaseTable headers={headers} items={items} />;
```

---

## Props

### `BaseTableProps`

| Prop                    | Type                                                             | Default | Description                                |
| ----------------------- | ---------------------------------------------------------------- | ------- | ------------------------------------------ |
| `height`                | `string`                                                         | `auto`  | Sets the height of the table.              |
| `headers`               | `BaseTableHeader[]`                                              | -       | Defines the headers of the table.          |
| `items`                 | `TableItem[]`                                                    | -       | Data items to display in the table.        |
| `marginTop`             | `string`                                                         | `0`     | Top margin for the table.                  |
| `noBorder`              | `boolean`                                                        | `false` | Removes the border around the table.       |
| `pinColumns`            | `boolean`                                                        | `false` | Pins columns for horizontal scrolling.     |
| `alignCenterInLine`     | `boolean`                                                        | `false` | Centers content within rows.               |
| `currentSortId`         | `string`                                                         | -       | ID of the column currently being sorted.   |
| `highlightCondition`    | `{ propertyId: string, value: unknown, style: CSSProperties }[]` | -       | Conditions for highlighting rows.          |
| `onResetSort`           | `() => void`                                                     | -       | Callback to reset sorting.                 |
| `onRowDoubleClick`      | `(item: TableItem) => void`                                      | -       | Callback for double-clicking a row.        |
| `onSortByColumn`        | `(columnId: string) => void`                                     | -       | Callback for sorting by a column.          |
| `showIndex`             | `boolean`                                                        | `false` | Shows an index column.                     |
| `indexUseOriginalOrder` | `boolean`                                                        | `false` | Uses original item order for index column. |
| `contrastRow`           | `boolean`                                                        | `false` | Alternates row background for contrast.    |
| `activeFilters`         | `ActiveTableFilter[]`                                            | -       | Active filters for columns.                |
| `groupBy`               | `string`                                                         | -       | Groups rows by this column ID.             |
| `currentUsername`       | `string`                                                         | -       | Pass current user for custom logic.        |
| `comments`              | `CommentData[]`                                                  | -       | Comments to display in the table.          |

---

## Header Definition

### `BaseTableHeader`

| Property       | Type                                                              | Description                                     |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `id`           | `string`                                                          | Unique identifier for the column.               |
| `text`         | `string`                                                          | Display text for the column header.             |
| `type`         | `'string', 'list', 'number'`                                      | Type of data in the column.                     |
| `customHeader` | `(header: BaseTableHeader) => ReactNode`                          | Custom rendering function for the header.       |
| `customRender` | `(item: TableItem, header: BaseTableHeader) => ReactNode`         | Custom rendering function for the cell content. |
| `sortable`     | `boolean`                                                         | Enables sorting for the column.                 |
| `customSort`   | `(a: TableItem, b: TableItem, ascendingOrder: boolean) => number` | Custom sorting function for the column.         |
| `hasFilter`    | `boolean`                                                         | Enables filtering for the column.               |
| `children`     | `BaseTableHeader[]`                                               | Nested columns for grouped headers.             |
| `editOptions`  | `{ editable, required, type, defaultValue }`                      | Editing options for inline editing.             |

---

## Data Items

A `TableItem` is an object where each key matches a column ID defined in `headers`.

```javascript
const item = {
  name: "John Doe",
  age: "30",
};
```

---

## Advanced Functionality

### 1. **Row Highlighting**

Highlight rows based on conditions:

```jsx
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
/>;
```

---

### 2. **Custom Cell Rendering**

Customize cell content using `customRender`:

```jsx
const headers = [
  {
    id: "name",
    text: "Name",
    customRender: (item) => <strong>{item.name}</strong>,
  },
];
```

---

### 3. **Sorting**

Handle sorting logic with the `onSortByColumn` callback:

```jsx
const handleSort = (columnId) => {
  console.log(`Sorting by column: ${columnId}`);
};

<BaseTable headers={headers} items={items} onSortByColumn={handleSort} />;
```

---

### 4. **Grouping Rows**

Group rows by a column and allow collapsing:

```jsx
<BaseTable
  headers={headers}
  items={items}
  groupBy="department" // group by the 'department' column
/>
```

---

### 5. **Drag & Drop Rows**

Enable drag-and-drop row reordering:

```jsx
<BaseTable headers={headers} items={items} enableRowDragDrop={true} />
```

---

### 6. **Context Menu**

Show a custom context menu on right-click:

```jsx
<BaseTable
  headers={headers}
  items={items}
  contextMenuActions={[
    { label: "Edit", onClick: (item) => editItem(item) },
    { label: "Delete", onClick: (item) => deleteItem(item) },
  ]}
/>
```

---

### 7. **Inline Editing**

Allow editing cell values directly in the table by setting `editOptions` in headers.

```jsx
const headers = [
  {
    id: "age",
    text: "Age",
    editOptions: {
      editable: true,
      required: true,
      type: "number",
      defaultValue: 0,
    },
  },
];
```

---

### 8. **Custom Header Rendering**

Render custom header content:

```jsx
const headers = [
  {
    id: "actions",
    text: "",
    customHeader: () => <span>Actions</span>,
  },
];
```

---

## Styling & Theming

- Uses Tailwind CSS and DaisyUI for styling.
- You can override styles using Tailwind utility classes or DaisyUI themes.
- Arbitrary values (e.g. `bg-[#f44333]`) are supported if included as static strings or added to the safelist in `tailwind.config.js`.

---

## How to test the package in dev

Yalc emulates npm publish. It is preferred over npm link for fewer issues.

```bash
npm i yalc -g
```

In your package:

```bash
yalc publish
```

In the project that wants to consume the package:

```bash
yalc add @redevilkz/react-base-table
```

After a rebuild in your package:

```bash
yalc push
```

When you change something in your library:

```bash
npm run buildForNPM && yalc push --sig
```

---

## License

This project is licensed under the [MIT License](LICENSE).
