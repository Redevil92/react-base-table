import "./App.css";
import "./output.css";
import BaseTableHeader from "./components/BaseTable/models/BaseTableHeaders";
import BaseTable from "./components/BaseTable/BaseTable";

function App() {
  const headers: BaseTableHeader[] = [
    {
      id: "test",
      text: "test",
      hasFilter: true,
    },
    {
      id: "test",
      text: "test",
    },
    {
      id: "test",
      text: "test",
    },
    {
      id: "test",
      text: "test",
    },
  ];
  const items = [
    { test: "ssss" },
    { test: "ssss" },
    { test: "ssss" },
    { test: "ssss" },
    { test: "ssss" },
  ];

  return (
    <>
      <BaseTable headers={headers} items={items}></BaseTable>
    </>
  );
}

export default App;
