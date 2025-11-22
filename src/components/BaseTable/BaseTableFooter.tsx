import { memo, type ReactNode } from "react";

interface BaseTableFooterProps {
  footerCustomRender?: (
    itemsCount: number,
    filteredItemsCount: number,
    colSpan: number
  ) => ReactNode;
  itemsCount: number;
  filteredItemsCount: number;
  colSpan: number;
}

function BaseTableFooter(props: Readonly<BaseTableFooterProps>) {
  return (
    // <tfoot className=" sticky bottom-0 z-900">
    //   <tr className="bg-[#f0f0f0] p-0">
    //     <td
    //       colSpan={props.colSpan}
    //       className="font-semibold text-sm p-0 text-left relative"
    //     >
    //       {/* This outer div allows the inner content to be positioned absolutely */}
    //       <div className="r elative h-5 w-full">
    //         {props.footerCustomRender ? (
    //           props.footerCustomRender(
    //             props.itemsCount,
    //             props.filteredItemsCount,
    //             props.colSpan
    //           )
    //         ) : (
    //           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex justify-end gap-8 items-center text-gray-600">
    //             {props.filteredItemsCount > 0 && (
    //               <div>
    //                 Rows: {props.filteredItemsCount} of {props.itemsCount}
    //               </div>
    //             )}
    //             <div>Total Rows: {props.itemsCount}</div>
    //             <div>Filtered: {props.filteredItemsCount}</div>
    //           </div>
    //         )}
    //       </div>
    //     </td>
    //   </tr>
    // </tfoot>
    <div className="relative h-6 w-full bg-[#f0f0f0] border border-gray-200 text-sm font-semibold">
      {props.footerCustomRender ? (
        props.footerCustomRender(
          props.itemsCount,
          props.filteredItemsCount,
          props.colSpan
        )
      ) : (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex justify-end gap-8 items-center text-gray-600">
          {props.filteredItemsCount !== props.itemsCount && (
            <div>
              Rows: {props.filteredItemsCount} of {props.itemsCount}
            </div>
          )}
          <div>Total Rows: {props.itemsCount}</div>
          <div>Filtered: {props.filteredItemsCount}</div>
        </div>
      )}
    </div>
  );
}

export default memo(BaseTableFooter);
