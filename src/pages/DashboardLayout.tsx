
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
