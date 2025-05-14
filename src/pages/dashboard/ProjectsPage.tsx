
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
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

// Mock data for projects
const initialProjects = [
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
    status: "active",
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
    status: "active",
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
    status: "active",
  },
  {
    id: "4",
    title: "Customer Portal",
    description: "Build a customer portal for account management and support.",
    progress: 60,
    dueDate: "2025-07-15",
    members: [
      { id: "2", name: "Mike Smith", initials: "MS" },
      { id: "6", name: "Emily White", initials: "EW" },
    ],
    tasks: { total: 20, completed: 12 },
    status: "active",
  },
  {
    id: "5",
    title: "Product Analytics",
    description: "Implement analytics tracking for user behavior in the product.",
    progress: 30,
    dueDate: "2025-08-01",
    members: [
      { id: "1", name: "Anna Johnson", initials: "AJ" },
      { id: "4", name: "Tom Wilson", initials: "TW" },
    ],
    tasks: { total: 15, completed: 5 },
    status: "active",
  },
  {
    id: "6",
    title: "Internal Dashboard",
    description: "Build an internal dashboard for company KPIs and metrics.",
    progress: 10,
    dueDate: "2025-08-30",
    members: [
      { id: "5", name: "James Brown", initials: "JB" },
    ],
    tasks: { total: 12, completed: 1 },
    status: "active",
  },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const filteredProjects = filterStatus === "all"
    ? projects
    : projects.filter(project => project.status === filterStatus);

  const handleCreateProject = () => {
    const project = {
      id: (projects.length + 1).toString(),
      title: newProject.title,
      description: newProject.description,
      progress: 0,
      dueDate: newProject.dueDate,
      members: [
        { id: "1", name: "Anna Johnson", initials: "AJ" },
      ],
      tasks: { total: 0, completed: 0 },
      status: "active",
    };

    setProjects([...projects, project]);
    setNewProject({ title: "", description: "", dueDate: "" });
    setIsDialogOpen(false);
    toast.success("Project created successfully!");
  };

  return (
    <>
      <DashboardHeader title="Projects" />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Enter project title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newProject.dueDate}
                    onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-purple-500 hover:bg-purple-600" onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found.</p>
          </div>
        )}
      </main>
    </>
  );
};

export default ProjectsPage;
