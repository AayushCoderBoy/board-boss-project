
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Loader2, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: string | null;
  created_at: string;
}

const PROJECT_STATUSES = [
  "Not Started",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled"
];

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Error loading projects");
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from("projects")
        .insert([{ 
          title: title.trim(),
          description: description.trim() || null,
          deadline: deadline || null,
          status,
          owner_id: user?.id
        }])
        .select();

      if (error) throw error;
      
      toast.success("Project created successfully!");
      setProjects([...(data || []), ...projects]);
      resetForm();
      setIsCreateDialogOpen(false);
      await fetchProjects();
    } catch (error: any) {
      toast.error("Error creating project");
      console.error("Error creating project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectToEdit || !title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("projects")
        .update({ 
          title: title.trim(),
          description: description.trim() || null,
          deadline: deadline || null,
          status
        })
        .eq("id", projectToEdit.id);

      if (error) throw error;
      
      toast.success("Project updated successfully!");
      resetForm();
      setIsEditDialogOpen(false);
      await fetchProjects();
    } catch (error: any) {
      toast.error("Error updating project");
      console.error("Error updating project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToEdit) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToEdit.id);

      if (error) throw error;
      
      toast.success("Project deleted successfully!");
      setProjects(projects.filter(p => p.id !== projectToEdit.id));
      setProjectToEdit(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Error deleting project");
      console.error("Error deleting project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setStatus("Not Started");
    setProjectToEdit(null);
  };

  const openEditDialog = (project: Project) => {
    setProjectToEdit(project);
    setTitle(project.title);
    setDescription(project.description || "");
    setDeadline(project.deadline || "");
    setStatus(project.status || "Not Started");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToEdit(project);
    setIsDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Not Started": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600">Manage your projects</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0 bg-purple-500 hover:bg-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to your workspace
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input 
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-500 hover:bg-purple-600"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">You don't have any projects yet</p>
              <Button 
                className="bg-purple-500 hover:bg-purple-600"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openEditDialog(project)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => openDeleteDialog(project)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    <div className="flex flex-col space-y-2">
                      <div>Created on {new Date(project.created_at).toLocaleDateString()}</div>
                      {project.deadline && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" /> 
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </div>
                      )}
                      {project.status && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600">
                    {project.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    Open Project
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input 
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea 
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Deadline (optional)</Label>
              <Input 
                id="edit-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={`edit-${status}`} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-500 hover:bg-purple-600"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <p className="font-medium">Project: {projectToEdit?.title}</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
