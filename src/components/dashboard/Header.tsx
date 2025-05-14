
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Search,
  Plus,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
}

export function DashboardHeader({ title }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="ml-auto flex items-center gap-4">
        <div className="relative w-64 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-50 pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button size="icon" variant="outline">
          <Plus className="h-4 w-4" />
          <span className="sr-only">New item</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-full relative">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="p-4 cursor-pointer">
                <div>
                  <p className="font-medium">New task assigned</p>
                  <p className="text-sm text-gray-500">Jane Smith assigned you to a new task: "Update user interface"</p>
                  <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 cursor-pointer">
                <div>
                  <p className="font-medium">Project deadline reminder</p>
                  <p className="text-sm text-gray-500">The "Website redesign" project is due in 3 days</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 cursor-pointer">
                <div>
                  <p className="font-medium">Comment on your task</p>
                  <p className="text-sm text-gray-500">John Doe commented on your task: "Great progress so far!"</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday at 2:30 PM</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <Link to="/dashboard/notifications" className="block w-full">
              <Button variant="ghost" className="w-full justify-center">
                View all notifications
              </Button>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-purple-100 text-purple-900">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/dashboard/profile">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            </Link>
            <Link to="/dashboard/settings">
              <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link to="/logout">
              <DropdownMenuItem className="text-red-500 cursor-pointer">Logout</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
