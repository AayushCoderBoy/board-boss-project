
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for projects
const projects = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Modernize the company website with new branding and improved user experience.",
    progress: 75,
    dueDate: "2025-06-15",
    members: [
      { id: "1", name: "Anna Johnson", initials: "AJ" },
      { id: "2", name: "Mike Smith", initials: "MS" },
      { id: "3", name: "Sarah Davis", initials: "SD" },
      { id: "4", name: "Tom Wilson", initials: "TW" },
    ],
    tasks: { total: 24, completed: 18 },
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Create a cross-platform mobile application for iOS and Android.",
    progress: 40,
    dueDate: "2025-07-30",
    members: [
      { id: "1", name: "Anna Johnson", initials: "AJ" },
      { id: "5", name: "James Brown", initials: "JB" },
      { id: "6", name: "Emily White", initials: "EW" },
    ],
    tasks: { total: 32, completed: 12 },
  },
  {
    id: "3",
    title: "Marketing Campaign",
    description: "Q2 marketing campaign for new product launch.",
    progress: 20,
    dueDate: "2025-06-01",
    members: [
      { id: "3", name: "Sarah Davis", initials: "SD" },
      { id: "7", name: "David Miller", initials: "DM" },
    ],
    tasks: { total: 18, completed: 4 },
  },
];

// Mock data for tasks
const tasks = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create wireframes and mockups for the new landing page.",
    priority: "high" as const,
    dueDate: "2025-05-20",
    assignee: { id: "1", name: "Anna Johnson", initials: "AJ" },
    project: { id: "1", name: "Website Redesign" },
  },
  {
    id: "2",
    title: "Implement authentication",
    description: "Add user login and registration functionality.",
    priority: "medium" as const,
    dueDate: "2025-05-25",
    assignee: { id: "2", name: "Mike Smith", initials: "MS" },
    project: { id: "2", name: "Mobile App Development" },
  },
  {
    id: "3",
    title: "Write content for blog",
    description: "Create 5 blog posts for the company blog.",
    priority: "low" as const,
    dueDate: "2025-05-30",
    assignee: { id: "3", name: "Sarah Davis", initials: "SD" },
    project: { id: "3", name: "Marketing Campaign" },
  },
  {
    id: "4",
    title: "SEO optimization",
    description: "Improve search engine ranking for key pages.",
    priority: "medium" as const,
    dueDate: "2025-06-05",
    assignee: { id: "7", name: "David Miller", initials: "DM" },
    project: { id: "1", name: "Website Redesign" },
  },
];

// Mock data for chart
const chartData = [
  { name: "Mon", completed: 5, assigned: 8 },
  { name: "Tue", completed: 7, assigned: 10 },
  { name: "Wed", completed: 6, assigned: 8 },
  { name: "Thu", completed: 9, assigned: 12 },
  { name: "Fri", completed: 4, assigned: 6 },
  { name: "Sat", completed: 2, assigned: 3 },
  { name: "Sun", completed: 1, assigned: 1 },
];

// Stat cards data
const statCards = [
  { label: "Active Projects", value: 8, change: "+2", color: "text-green-500" },
  { label: "Pending Tasks", value: 24, change: "-5", color: "text-red-500" },
  { label: "Team Members", value: 12, change: "+1", color: "text-green-500" },
  { label: "Completed Tasks", value: 156, change: "+23", color: "text-green-500" },
];

const OverviewPage = () => {
  return (
    <>
      <DashboardHeader title="Overview" />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <div className={`text-xs ${stat.color} mt-1`}>{stat.change} from last week</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          <Card className="md:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="assigned" name="Tasks Assigned" fill="#9b87f5" />
                    <Bar dataKey="completed" name="Tasks Completed" fill="#48bb78" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskCard key={task.id} {...task} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default OverviewPage;
