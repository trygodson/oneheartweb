import React, { useContext } from "react";
import { BiMenu } from "react-icons/bi";
import { GrClose } from "react-icons/gr";
import { ToggleSidebarContext } from "../App";

const PageHeader = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useContext(ToggleSidebarContext);

  return (
    <div className="flex items-center gap-5 mb-7 w-full">
      <span className="block lg:hidden">
        {!sidebarOpen ? (
          <BiMenu onClick={() => setSidebarOpen(true)} size={30} />
        ) : (
          <GrClose
            className="mt-1 ml-1"
            onClick={() => setSidebarOpen(false)}
            size={25}
          />
        )}
      </span>
      <p className="text-2xl font-semibold opacity-80 flex-1">{children}</p>
    </div>
  );
};

export default PageHeader;
