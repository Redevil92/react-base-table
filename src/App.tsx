import "./App.css";

import BaseTableHeader from "./components/BaseTable/models/BaseTableHeaders";
import BaseTable from "./components/BaseTable/BaseTable";
import TableItem from "./components/BaseTable/models/TableItem";
import ActiveTableFilter from "./components/BaseTable/models/ActiveTableFilter";

function App() {
  const headers: BaseTableHeader[] = [
    {
      id: "name",
      text: "Full name",
      sortable: true,
      hasFilter: false,
      children: [
        {
          id: "fullNameNested",
          text: "Full name nested",
          sortable: true,
          hasFilter: true,
          children: [
            { id: "name", text: "Name", sortable: true, hasFilter: true },
            {
              id: "lastName",
              text: "Last name",
              sortable: true,
              hasFilter: true,
            },
          ],
        },
      ],
    },
    {
      id: "age",
      text: "age",
      sortable: true,
      hasFilter: true,
    },
  ];

  const items: TableItem[] = [
    { name: "Alice", lastName: "Test1", age: 25 },
    { name: "Bob", lastName: "Test2", age: 30 },
    { name: "Charlie", lastName: "Test3", age: 35 },
    { name: "Charlie", lastName: "Test4", age: 9.999 },
    { name: "Charlie", lastName: "Test5", age: 350 },
    { name: "Charlie", lastName: "Test6", age: 99 },
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
