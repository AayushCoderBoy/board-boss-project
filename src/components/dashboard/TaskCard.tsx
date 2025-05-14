
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  project: {
    id: string;
    name: string;
  };
}

export function TaskCard({
  id,
  title,
  description,
  priority,
  dueDate,
  assignee,
  project,
}: TaskCardProps) {
  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <Card className="task-card">
      <CardContent className="p-0">
        <div className="px-4 pt-4 pb-2">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 line-clamp-1">{title}</h3>
            <Badge variant="outline" className={`${priorityColors[priority]} capitalize`}>
              {priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            
            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                  {assignee.initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        {project.name}
      </CardFooter>
    </Card>
  );
}
