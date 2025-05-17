
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  board: {
    title: string;
    project: {
      title: string;
      id: string;
    };
  };
}

const CalendarPage = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, date]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

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
        .gte("due_date", monthStart.toISOString())
        .lte("due_date", monthEnd.toISOString())
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    const tasksOnDay = tasks.filter(
      task => task.due_date && isSameDay(new Date(task.due_date), day)
    );
    
    setSelectedDayTasks(tasksOnDay);
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  // Function to get tasks due on a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(
      task => task.due_date && isSameDay(new Date(task.due_date), day)
    );
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-gray-600">Visualize your tasks due dates</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    onDayClick={handleDayClick}
                    className="p-3 pointer-events-auto"
                    modifiers={{
                      hasTasks: (day) => getTasksForDay(day).length > 0,
                    }}
                    modifiersClassNames={{
                      hasTasks: "bg-purple-50 font-bold text-purple-600 relative",
                    }}
                    components={{
                      DayContent: (props) => {
                        const dayTasks = getTasksForDay(props.date);
                        return (
                          <div className="flex flex-col items-center">
                            <div>{props.date.getDate()}</div>
                            {dayTasks.length > 0 && (
                              <div className="absolute bottom-1 w-5 h-1 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                        );
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-gray-500 text-center">No tasks scheduled this month</p>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {tasks.slice(0, 10).map((task) => (
                      <Card key={task.id} className="p-3">
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-xs text-gray-500 mb-2">
                          {task.board.project.title} &gt; {task.board.title}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-800">
                            {task.due_date ? format(new Date(task.due_date), "MMM d") : "No date"}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Day Tasks Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Tasks"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedDayTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks scheduled for this day</p>
            ) : (
              <div className="space-y-4">
                {selectedDayTasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="font-medium text-lg">{task.title}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {task.board.project.title} &gt; {task.board.title}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
