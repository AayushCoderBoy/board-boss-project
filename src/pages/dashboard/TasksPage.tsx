
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Mock data for tasks
const initialTasks = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create wireframes and mockups for the new landing page.",
    priority: "high" as const,
    dueDate: "2025-05-20",
    assignee: { id: "1", name: "Anna Johnson", initials: "AJ" },
    project: { id: "1", name: "Website Redesign" },
    status: "todo",
  },
  {
    id: "2",
    title: "Implement authentication",
    description: "Add user login and registration functionality.",
    priority: "medium" as const,
    dueDate: "2025-05-25",
    assignee: { id: "2", name: "Mike Smith", initials: "MS" },
    project: { id: "2", name: "Mobile App Development" },
    status: "in-progress",
  },
  {
    id: "3",
    title: "Write content for blog",
    description: "Create 5 blog posts for the company blog.",
    priority: "low" as const,
    dueDate: "2025-05-30",
    assignee: { id: "3", name: "Sarah Davis", initials: "SD" },
    project: { id: "3", name: "Marketing Campaign" },
    status: "todo",
  },
  {
    id: "4",
    title: "SEO optimization",
    description: "Improve search engine ranking for key pages.",
    priority: "medium" as const,
    dueDate: "2025-06-05",
    assignee: { id: "7", name: "David Miller", initials: "DM" },
    project: { id: "1", name: "Website Redesign" },
    status: "todo",
  },
  {
    id: "5",
    title: "Fix responsiveness issues",
    description: "Fix UI bugs on mobile devices.",
    priority: "high" as const,
    dueDate: "2025-05-22",
    assignee: { id: "2", name: "Mike Smith", initials: "MS" },
    project: { id: "1", name: "Website Redesign" },
    status: "in-progress",
  },
  {
    id: "6",
    title: "Create email templates",
    description: "Design and implement email notification templates.",
    priority: "low" as const,
    dueDate: "2025-06-10",
    assignee: { id: "6", name: "Emily White", initials: "EW" },
    project: { id: "2", name: "Mobile App Development" },
    status: "done",
  },
];

// Mock project data for select dropdown
const projects = [
  { id: "1", name: "Website Redesign" },
  { id: "2", name: "Mobile App Development" },
  { id: "3", name: "Marketing Campaign" },
  { id: "4", name: "Customer Portal" },
  { id: "5", name: "Product Analytics" },
  { id: "6", name: "Internal Dashboard" },
];

// Mock users for assignee dropdown
const users = [
  { id: "1", name: "Anna Johnson", initials: "AJ" },
  { id: "2", name: "Mike Smith", initials: "MS" },
  { id: "3", name: "Sarah Davis", initials: "SD" },
  { id: "4", name: "Tom Wilson", initials: "TW" },
  { id: "5", name: "James Brown", initials: "JB" },
  { id: "6", name: "Emily White", initials: "EW" },
  { id: "7", name: "David Miller", initials: "DM" },
];

const TasksPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    projectId: "",
    dueDate: "",
    assigneeId: "",
  });
  
  const [activeView, setActiveView] = useState("kanban");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const doneTasks = tasks.filter(task => task.status === "done");

  const handleCreateTask = () => {
    const selectedProject = projects.find(p => p.id === newTask.projectId);
    const selectedAssignee = users.find(u => u.id === newTask.assigneeId);
    
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    const task = {
      id: (tasks.length + 1).toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority as "low" | "medium" | "high",
      dueDate: newTask.dueDate,
      assignee: selectedAssignee ? {
        id: selectedAssignee.id,
        name: selectedAssignee.name,
        initials: selectedAssignee.initials,
      } : undefined,
      project: {
        id: selectedProject.id,
        name: selectedProject.name,
      },
      status: "todo",
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      projectId: "",
      dueDate: "",
      assigneeId: "",
    });
    setIsDialogOpen(false);
    toast.success("Task created successfully!");
  };

  const handleDragStart = (taskId: string) => {
    setIsDragging(true);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    
    if (!draggedTaskId) return;
    
    setTasks(tasks.map(task => 
      task.id === draggedTaskId ? { ...task, status } : task
    ));
    
    setIsDragging(false);
    setDraggedTaskId(null);
  };

  return (
    <>
      <DashboardHeader title="Tasks" />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant={activeView === "kanban" ? "default" : "outline"}
              onClick={() => setActiveView("kanban")}
              className={activeView === "kanban" ? "bg-purple-500 hover:bg-purple-600" : ""}
            >
              Kanban
            </Button>
            <Button 
              variant={activeView === "list" ? "default" : "outline"}
              onClick={() => setActiveView("list")}
              className={activeView === "list" ? "bg-purple-500 hover:bg-purple-600" : ""}
            >
              List
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new task.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select 
                    value={newTask.projectId} 
                    onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select 
                    value={newTask.assigneeId} 
                    onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-purple-500 hover:bg-purple-600" onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {activeView === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "todo")}
            >
              <h2 className="font-semibold mb-4 flex items-center">
                <div className="bg-gray-400 h-3 w-3 rounded-full mr-2"></div>
                To Do
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2">
                  {todoTasks.length}
                </span>
              </h2>
              {todoTasks.map((task) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <TaskCard {...task} />
                </div>
              ))}
            </div>
            
            {/* In Progress Column */}
            <div
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "in-progress")}
            >
              <h2 className="font-semibold mb-4 flex items-center">
                <div className="bg-blue-400 h-3 w-3 rounded-full mr-2"></div>
                In Progress
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2">
                  {inProgressTasks.length}
                </span>
              </h2>
              {inProgressTasks.map((task) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <TaskCard {...task} />
                </div>
              ))}
            </div>
            
            {/* Done Column */}
            <div
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "done")}
            >
              <h2 className="font-semibold mb-4 flex items-center">
                <div className="bg-green-400 h-3 w-3 rounded-full mr-2"></div>
                Done
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2">
                  {doneTasks.length}
                </span>
              </h2>
              {doneTasks.map((task) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <TaskCard {...task} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tasks found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default TasksPage;
