
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader2, Plus, CheckCircle, Clock, BarChart3, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardCounts {
  projects: number;
  tasks: number;
  completedTasks: number;
  upcomingTasks: number;
}

const OverviewPage = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts>({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    upcomingTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get project count
      const { count: projectCount, error: projectError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (projectError) throw projectError;

      // Get task count
      const { count: taskCount, error: taskError } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("assignee_id", user?.id);

      if (taskError) throw taskError;

      // Get recent projects
      const { data: projects, error: recentError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentError) throw recentError;
      
      // In a real app, we would fetch completed tasks and upcoming tasks
      // For now, we'll simulate this data
      const completedTasks = 0; // This would be a real query in a complete app
      const upcomingTasks = taskCount || 0; // Assuming all tasks are upcoming for the demo
      
      setCounts({
        projects: projectCount || 0,
        tasks: taskCount || 0,
        completedTasks,
        upcomingTasks
      });
      
      setRecentProjects(projects || []);
    } catch (error: any) {
      toast.error("Error loading dashboard data");
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-gray-600">Welcome back to your dashboard</p>
        </div>
        <Link to="/dashboard/projects">
          <Button className="mt-4 md:mt-0 bg-purple-500 hover:bg-purple-600">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-3xl">{counts.projects}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-gray-500">
                  Across all your workspaces
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/projects" className="text-sm text-purple-500 hover:text-purple-600 flex items-center">
                  View all projects
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tasks</CardDescription>
                <CardTitle className="text-3xl">{counts.tasks}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-gray-500">
                  Assigned to you
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/tasks" className="text-sm text-purple-500 hover:text-purple-600 flex items-center">
                  View all tasks
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardDescription>Completed Tasks</CardDescription>
                  <CardTitle className="text-3xl">{counts.completedTasks}</CardTitle>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-gray-500">
                  Great job!
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/tasks?filter=completed" className="text-sm text-purple-500 hover:text-purple-600 flex items-center">
                  View completed
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardDescription>Upcoming Tasks</CardDescription>
                  <CardTitle className="text-3xl">{counts.upcomingTasks}</CardTitle>
                </div>
                <Clock className="h-6 w-6 text-orange-500" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-gray-500">
                  Due soon
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/tasks?filter=upcoming" className="text-sm text-purple-500 hover:text-purple-600 flex items-center">
                  View upcoming
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Recent Projects */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Link to="/dashboard/projects">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>
                        Created on {new Date(project.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2">
                        {project.description || "No description provided."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Open Project</Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 mb-4">You haven't created any projects yet</p>
                    <Link to="/dashboard/projects">
                      <Button className="bg-purple-500 hover:bg-purple-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Activity Charts - Placeholder for now */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Activity Overview</h2>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </div>
            
            <Card>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Activity charts will appear here</p>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">
                    Track your productivity and project progress with detailed analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
