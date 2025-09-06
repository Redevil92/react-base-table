import "./App.css";
import BaseTableHeader, {
  TableHeaderType,
} from "./components/BaseTable/models/BaseTableHeaders";
import TableItem from "./components/BaseTable/models/TableItem";
import ActiveTableFilter from "./components/BaseTable/models/ActiveTableFilter";
import { useState } from "react";
import { simpleItems } from "./DUMMY_ITEMS";
import BaseTableWithContext from "./components/BaseTable/BaseTableWithContext";

function App() {
  const headers: BaseTableHeader[] = [
    {
      id: "",
      text: "",
      sortable: true,
      hasFilter: false,
      width: 50,
      customRender: (item: TableItem) => (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-blue-600"
          checked={true}
          onChange={() => {}}
        />
      ),
    },
    {
      id: "tag",
      text: "id",
      sortable: true,
      hasFilter: true,
      editOptions: {
        editable: true,
        required: true,
        type: TableHeaderType.STRING,
        defaultValue: 0,
      },
      width: 180,
    },
    {
      id: "fullName",
      text: "Full Name",
      sortable: false,
      hasFilter: false,
      children: [
        {
          id: "firstName",
          text: "First Name",
          sortable: true,
          hasFilter: true,
          width: 100,
          editOptions: {
            editable: true,
            required: true,
            type: TableHeaderType.STRING,
            defaultValue: 0,
          },
        },
        {
          id: "lastName",
          text: "Last Name",
          sortable: true,
          hasFilter: true,
          width: 100,
          editOptions: {
            editable: true,
            required: true,
            type: TableHeaderType.STRING,
            defaultValue: 0,
          },
        },
      ],
    },
    //  { id: "lastName", text: "Name", sortable: true, hasFilter: true },
    {
      id: "age",
      text: "Age",
      sortable: true,
      hasFilter: true,
      editOptions: {
        editable: true,
        required: true,
        type: TableHeaderType.NUMBER,
        defaultValue: 0,
      },
      width: 80,
    },
  ];

  const [items, setItems] = useState(simpleItems);

  const activeFilters: ActiveTableFilter[] = [];

  const onCellBlur = (item: any, originalIndex: number) => {
    const updatedItems = [...items];
    updatedItems[originalIndex] = item;
    setItems(updatedItems);
  };

  const onBulkChange = (
    newItems: { itemUpdated: any; originalIndex: number }[]
  ) => {
    console.log("onBulkChange", newItems);
    const itemsToUpdate = [...items];

    newItems.forEach(({ itemUpdated, originalIndex }) => {
      itemsToUpdate[originalIndex] = itemUpdated;
    });

    setItems(itemsToUpdate);
  };

  return (
    <>
      <div>
        <BaseTableWithContext
          showIndex
          headers={headers}
          items={items}
          activeFilters={activeFilters}
          groupBy="group"
          onChange={onCellBlur}
          onBulkChange={onBulkChange}
          // groupByRender={() => (
          //   <span className="font-semibold text-lg">{item.name}</span>
          // )}
        ></BaseTableWithContext>
      </div>
    </>
  );
}

export default App;
