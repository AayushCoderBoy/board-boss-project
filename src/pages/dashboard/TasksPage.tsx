
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string | null;
  board: {
    title: string;
    project: {
      title: string;
    };
  };
  due_date: string | null;
  created_at: string;
}

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

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
              title
            )
          )
        `)
        .eq("assignee_id", user?.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error("Error loading tasks");
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
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
        // In a real app, you would check a completed field
        // For this demo, we'll just return an empty array
        return [];
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-600">View and manage your assigned tasks</p>
        </div>
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
          <Button className="bg-purple-500 hover:bg-purple-600">
            Go to Projects
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
                <Badge variant="outline" className={getDueDateColor(task.due_date)}>
                  {formatDueDate(task.due_date)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {task.description || "No description provided."}
              </p>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> 
                  Mark Complete
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
