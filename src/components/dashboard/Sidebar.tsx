
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home,
  ListTodo,
  Calendar,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Briefcase
} from "lucide-react";

interface SidebarNavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed: boolean;
}

const SidebarNavItem = ({ icon: Icon, label, href, isCollapsed }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link 
      to={href} 
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive ? 
          "bg-purple-500 text-white" : 
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon className="h-5 w-5" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-purple-500 flex items-center justify-center mr-2">
            <span className="text-white font-bold">T</span>
          </div>
          {!isCollapsed && <span className="text-xl font-bold text-gray-900">TaskFlow</span>}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarNavItem icon={Home} label="Overview" href="/dashboard" isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Briefcase} label="Projects" href="/dashboard/projects" isCollapsed={isCollapsed} />
        <SidebarNavItem icon={ListTodo} label="Tasks" href="/dashboard/tasks" isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Calendar} label="Calendar" href="/dashboard/calendar" isCollapsed={isCollapsed} />
        <SidebarNavItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" isCollapsed={isCollapsed} />
      </nav>
      
      {/* Footer */}
      <div className="border-t p-3 space-y-1">
        <SidebarNavItem icon={User} label="Profile" href="/dashboard/profile" isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Settings} label="Settings" href="/dashboard/settings" isCollapsed={isCollapsed} />
        <Link 
          to="/logout" 
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
}
