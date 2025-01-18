import "./App.css";
import "./output.css";
import BaseTableHeader from "./components/BaseTable/models/BaseTableHeaders";
import BaseTable from "./components/BaseTable/BaseTable";
import TableItem from "./components/BaseTable/models/TableItem";
import ActiveTableFilter from "./components/BaseTable/models/ActiveTableFilter";

function App() {
  const headers: BaseTableHeader[] = [
    { id: "name", text: "Name", sortable: true, hasFilter: true },
    { id: "age", text: "Age", sortable: true, hasFilter: false },
  ];

  const items: TableItem[] = [
    { name: "Alice", age: "25" },
    { name: "Bob", age: "30" },
    { name: "Charlie", age: "35" },
  ];

  const activeFilters: ActiveTableFilter[] = [
    { headerId: "name", itemsToHide: ["Alice"] },
  ];

  return (
    <>
      <div className="card">
        HALO
        <BaseTable
          headers={headers}
          items={items}
          activeFilters={activeFilters}
        ></BaseTable>
      </div>
    </>
  );
}

export default App;
