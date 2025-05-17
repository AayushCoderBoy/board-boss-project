
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface AnalyticsData {
  tasksByStatus: { name: string; value: number }[];
  tasksByPriority: { name: string; value: number }[];
  projectProgress: { name: string; completed: number; total: number }[];
  tasksTrend: { date: string; count: number }[];
}

const CHART_COLORS = {
  "To Do": "#CBD5E1", // gray
  "In Progress": "#93C5FD", // blue
  "Under Review": "#FDE68A", // yellow
  "Completed": "#86EFAC", // green
  "Low": "#93C5FD", // blue
  "Medium": "#FDE68A", // yellow
  "High": "#FCA5A5", // orange
  "Urgent": "#F87171", // red
};

// Status colors for consistency
const STATUS_COLORS = ["#CBD5E1", "#93C5FD", "#FDE68A", "#86EFAC"];

// Priority colors for consistency
const PRIORITY_COLORS = ["#93C5FD", "#FDE68A", "#FCA5A5", "#F87171"];

// Project/trend colors
const PROJECT_COLORS = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    tasksByStatus: [],
    tasksByPriority: [],
    projectProgress: [],
    tasksTrend: [],
  });

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      // Fetch tasks for the date range
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          board:board_id (
            project:project_id (
              id,
              title
            )
          )
        `)
        .eq("assignee_id", user?.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      
      if (tasksError) throw tasksError;
      
      // Process tasks by status
      const statusCounts: Record<string, number> = {};
      
      tasksData?.forEach((task) => {
        const status = task.status || "No Status";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      const tasksByStatus = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
      }));
      
      // Process tasks by priority
      const priorityCounts: Record<string, number> = {};
      
      tasksData?.forEach((task) => {
        const priority = task.priority || "No Priority";
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      });
      
      const tasksByPriority = Object.entries(priorityCounts).map(([name, value]) => ({
        name,
        value
      }));
      
      // Process project progress
      const projectMap = new Map<string, { id: string; title: string; completed: number; total: number }>();
      
      tasksData?.forEach((task) => {
        if (!task.board?.project) return;
        
        const projectId = task.board.project.id;
        const projectTitle = task.board.project.title;
        
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, { 
            id: projectId, 
            title: projectTitle,
            completed: 0,
            total: 0 
          });
        }
        
        const project = projectMap.get(projectId)!;
        project.total += 1;
        
        if (task.status === "Completed") {
          project.completed += 1;
        }
      });
      
      const projectProgress = Array.from(projectMap.values()).map(project => ({
        name: project.title,
        completed: project.completed,
        total: project.total,
        progress: Math.round((project.completed / Math.max(project.total, 1)) * 100)
      }));
      
      // Calculate tasks trend (tasks created per day)
      const dateCounts: Record<string, number> = {};
      
      // Initialize all days in the range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dateCounts[dateStr] = 0;
      }
      
      // Count tasks by created date
      tasksData?.forEach((task) => {
        const dateStr = new Date(task.created_at).toISOString().split('T')[0];
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      });
      
      const tasksTrend = Object.entries(dateCounts).map(([date, count]) => ({
        date,
        count
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      setAnalyticsData({
        tasksByStatus,
        tasksByPriority,
        projectProgress,
        tasksTrend
      });
      
    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">Track project and task performance metrics</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 180 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Task Status Distribution</CardTitle>
                  <CardDescription>Breakdown of tasks by their current status</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {analyticsData.tasksByStatus.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  ) : (
                    <ChartContainer 
                      config={{
                        "To Do": { label: "To Do" },
                        "In Progress": { label: "In Progress" },
                        "Under Review": { label: "Under Review" },
                        "Completed": { label: "Completed" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.tasksByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analyticsData.tasksByStatus.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS] || STATUS_COLORS[index % STATUS_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            content={
                              <ChartTooltipContent />
                            }
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Priority Distribution</CardTitle>
                  <CardDescription>Breakdown of tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {analyticsData.tasksByPriority.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  ) : (
                    <ChartContainer 
                      config={{
                        "Low": { label: "Low" },
                        "Medium": { label: "Medium" },
                        "High": { label: "High" },
                        "Urgent": { label: "Urgent" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.tasksByPriority}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analyticsData.tasksByPriority.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS] || PRIORITY_COLORS[index % PRIORITY_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            content={
                              <ChartTooltipContent />
                            }
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Task Creation Trend</CardTitle>
                <CardDescription>Number of tasks created over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {analyticsData.tasksTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.tasksTrend}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth()+1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        name="Tasks Created"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Breakdown</CardTitle>
                <CardDescription>Detailed view of task distribution by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {analyticsData.tasksByStatus.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.tasksByStatus}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count">
                        {analyticsData.tasksByStatus.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS] || STATUS_COLORS[index % STATUS_COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Completion status of active projects</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {analyticsData.projectProgress.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.projectProgress}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax']} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="#8884d8" />
                      <Bar 
                        dataKey="total" 
                        name="Total Tasks" 
                        stackId="a" 
                        fill="#e0e0e0" 
                        // Don't actually render the total, only the completed
                        // This is to show the right proportions
                        fillOpacity={0.2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsPage;
