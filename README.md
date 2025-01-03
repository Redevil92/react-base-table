# @redevilkz/react-base-table

`@redevilkz/react-base-table` is a React plugin for rendering customizable and interactive table components. It provides a straightforward way to display tabular data with support for features like custom headers, rendering, sorting, and filtering.

---

## Installation

Install the package using npm or yarn:

```bash
npm install @redevilkz/react-base-table
# or
yarn add @redevilkz/react-base-table
```

---

## Usage

To use the table component in your project, import both the `BaseTable` component and the accompanying CSS styles:

```tsx
import { BaseTable } from "@redevilkz/react-base-table";
import "@redevilkz/react-base-table/style.css";
```

### Example

Here is a simple example of how to use the `BaseTable` component:

```tsx
const headers = [
  { id: "name", text: "Name", type: "string", sortable: true },
  { id: "age", text: "Age", type: "number", sortable: true },
  { id: "city", text: "City", type: "string" },
];

const items = [
  { name: "Alice", age: "25", city: "New York" },
  { name: "Bob", age: "30", city: "San Francisco" },
  { name: "Charlie", age: "35", city: "Chicago" },
];

<BaseTable headers={headers} items={items}></BaseTable>;
```

---

## Interfaces

### `BaseTableHeader`

The `headers` array passed to the `BaseTable` component must conform to the following interface:

```typescript
export default interface BaseTableHeader {
  id: string; // Unique identifier for the header
  text: string; // Text to display in the header
  type?: "string" | "list" | "number"; // Data type of the column
  customHeader?: (header: BaseTableHeader) => ReactNode; // Custom rendering for the header
  customRender?: (item: TableItem, header: BaseTableHeader) => ReactNode; // Custom rendering for cell content

  sortable?: boolean; // Whether the column is sortable
  customSort?: (a: TableItem, b: TableItem, ascendingOrder: boolean) => number; // Custom sort logic
  hasFilter?: boolean; // Whether the column has a filter
}
```

### `TableItem`

The `items` array passed to the `BaseTable` component must conform to the following interface:

```typescript
export default interface TableItem {
  [key: string]: string; // Key-value pairs for the row data
}
```

---

## Features

- **Custom Headers**: Use `customHeader` to define custom header rendering.
- **Custom Cell Rendering**: Use `customRender` for advanced cell content.
- **Sorting**: Built-in sorting with support for custom sorting logic.
- **Filtering**: Optional column filtering.
- **Type Support**: Specify column types (`string`, `list`, `number`) for tailored functionality.

---

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests on the [GitHub repository](https://github.com/redevilkz/react-base-table).

---

## License

This project is licensed under the [MIT License](LICENSE).
