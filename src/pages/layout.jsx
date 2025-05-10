import React from "react";
import SideBar from "../components/SideBar";

const Layout = ({ activePage, active }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3">
        <SideBar active={active} />
      </div>
      <div className="col-lg-10 col-md-9 p-5  h-[100vh] overflow-y-scroll bg-[#F2F5F9]">
        {activePage}
      </div>
    </div>
  );
};

export default Layout;
