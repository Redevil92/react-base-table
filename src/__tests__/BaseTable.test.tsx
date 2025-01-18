import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom"; // Ensure this line is included to fix the issue with 'toBeInTheDocument'
import BaseTableHeader from "../components/BaseTable/models/BaseTableHeaders";
import TableItem from "../components/BaseTable/models/TableItem";
import BaseTable from "../components/BaseTable/BaseTable";
import ActiveTableFilter from "../components/BaseTable/models/ActiveTableFilter";

// Mock data for testing
const headers: BaseTableHeader[] = [
  { id: "name", text: "Name", sortable: true, hasFilter: true },
  { id: "age", text: "Age", sortable: true, hasFilter: false },
];

const items: TableItem[] = [
  { name: "Alice", age: "25" },
  { name: "Bob", age: "30" },
  { name: "Charlie", age: "35" },
];

describe("BaseTable Component", () => {
  test("renders the table with correct headers and data", () => {
    render(<BaseTable headers={headers} items={items} />);

    // Check headers
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  test("calls onRowDoubleClick when a row is double-clicked", () => {
    const onRowDoubleClick = jest.fn();
    render(
      <BaseTable
        headers={headers}
        items={items}
        onRowDoubleClick={onRowDoubleClick}
      />
    );

    const row = screen.getByText("Alice").closest("tr");
    fireEvent.doubleClick(row!);

    expect(onRowDoubleClick).toHaveBeenCalledWith({ name: "Alice", age: "25" });
  });

  test("sorts the table by column when a header is clicked", () => {
    const onSortByColumn = jest.fn();
    render(
      <BaseTable
        headers={headers}
        items={items}
        onSortByColumn={onSortByColumn}
        currentSortId="name"
      />
    );

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    expect(onSortByColumn).toHaveBeenCalledWith("name");
  });

  test("renders the Clear All Filters button when filters are active", () => {
    const activeFilters: ActiveTableFilter[] = [
      { headerId: "name", itemsToHide: ["Alice"] },
    ];

    render(<BaseTable headers={headers} items={items} />);

    const clearFiltersButton = screen.queryByText("Clear all filters");
    expect(clearFiltersButton).not.toBeInTheDocument();

    // Simulate active filters
    render(
      <BaseTable
        headers={headers}
        items={items}
        currentSortId="name"
        activeFilters={activeFilters}
      />
    );

    expect(screen.getByText("Clear all filters")).toBeInTheDocument();
  });

  test("filters items based on active filters", () => {
    // Activate a filter that hides "Alice"
    const activeFilters: ActiveTableFilter[] = [
      { headerId: "name", itemsToHide: ["Alice"] },
    ];

    render(
      <BaseTable
        headers={headers}
        items={items}
        currentSortId="name"
        activeFilters={activeFilters}
      />
    );

    const rows = screen.getAllByRole("row");

    expect(rows.some((row) => within(row).queryByText("Alice"))).toBe(false);
    expect(rows.some((row) => within(row).queryByText("Bob"))).toBe(true);
  });

  test("renders custom header and cell content when provided", () => {
    const customHeaders: BaseTableHeader[] = [
      {
        id: "custom",
        text: "Custom Header",
        sortable: false,
        hasFilter: false,
        customHeader: () => (
          <div data-testid="custom-header">Custom Header</div>
        ),
        customRender: (item: TableItem) => (
          <div data-testid="custom-cell">{item.name}</div>
        ),
      },
    ];

    render(<BaseTable headers={customHeaders} items={items} />);

    expect(screen.getByTestId("custom-header")).toBeInTheDocument();
    expect(screen.getAllByTestId("custom-cell").length).toBe(items.length);
  });
});
