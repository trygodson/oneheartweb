import React from "react";
import { ImSpinner2 } from "react-icons/im";

const TableLoading = () => {
  return (
    <div className="flex items-center gap-1 justify-center text-sm p-2 py-14 font-medium">
      <ImSpinner2 className="animate-spin" />
      <p>Loading</p>
    </div>
  );
};

export default TableLoading;
