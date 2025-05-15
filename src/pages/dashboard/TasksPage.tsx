
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Calendar, CheckCircle2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  board: {
    title: string;
    project: {
      title: string;
      id: string;
    };
  };
  due_date: string | null;
  status: string | null;
  priority: string | null;
  created_at: string;
}

const TASK_STATUSES = ["To Do", "In Progress", "Under Review", "Completed"];
const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("To Do");
  const [priority, setPriority] = useState("Medium");
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .order("title", { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading projects:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          board:board_id (
            title,
            project:project_id (
              title,
              id
            )
          )
        `)
        .eq("assignee_id", user?.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Project selection is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // First get the default board for the project
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("id")
        .eq("project_id", selectedProject)
        .order("position", { ascending: true })
        .limit(1);
        
      if (boardError) throw boardError;
      
      if (!boardData || boardData.length === 0) {
        throw new Error("No board found for the selected project");
      }
      
      const boardId = boardData[0].id;
      
      // Now create the task
      const { error } = await supabase
        .from("tasks")
        .insert([{ 
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          status,
          priority,
          board_id: boardId,
          assignee_id: user?.id,
          created_by: user?.id,
          position: 0 // Default position
        }]);

      if (error) throw error;
      
      toast({
        title: "Task created successfully!",
      });
      
      resetForm();
      setIsCreateDialogOpen(false);
      await fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error creating task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("To Do");
    setPriority("Medium");
    setSelectedProject("");
  };

  const filterTasks = (tasks: Task[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'upcoming':
        return tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= today;
        });
      case 'completed':
        return tasks.filter(task => task.status === "Completed");
      default:
        return tasks;
    }
  };

  const displayTasks = filterTasks(tasks);
  
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    if (dueDate < today) {
      return `Overdue - ${dueDate.toLocaleDateString()}`;
    } else if (dueDate.getTime() === today.getTime()) {
      return 'Due Today';
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return 'Due Tomorrow';
    } else if (dueDate < nextWeek) {
      return `Due this week - ${dueDate.toLocaleDateString()}`;
    } else {
      return `Due ${dueDate.toLocaleDateString()}`;
    }
  };
  
  const getDueDateColor = (dateString: string | null) => {
    if (!dateString) return 'bg-gray-100 text-gray-800';
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      return 'bg-red-100 text-red-800';
    } else if (dueDate.getTime() === today.getTime()) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };
  
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "Low": return "bg-blue-100 text-blue-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-600">View and manage your assigned tasks</p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-purple-500 hover:bg-purple-600"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderTasksList()}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-0">
          {renderTasksList()}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {renderTasksList()}
        </TabsContent>
      </Tabs>
      
      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to track your work
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                required
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date (optional)</Label>
                <Input 
                  id="due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={setPriority}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
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
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderTasksList() {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      );
    }
    
    if (displayTasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No tasks found</p>
          <Button 
            className="bg-purple-500 hover:bg-purple-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {displayTasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>
                    {task.board.project.title} &gt; {task.board.title}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {task.priority && (
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  )}
                  <Badge variant="outline" className={getDueDateColor(task.due_date)}>
                    {formatDueDate(task.due_date)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {task.description || "No description provided."}
              </p>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> 
                  {task.status === "Completed" ? "Completed" : "Mark Complete"}
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> 
                  Set Due Date
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default TasksPage;
