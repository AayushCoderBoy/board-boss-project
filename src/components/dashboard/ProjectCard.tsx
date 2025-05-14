
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  members: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  }[];
  tasks: {
    total: number;
    completed: number;
  };
}

export function ProjectCard({
  id,
  title,
  description,
  progress,
  dueDate,
  members,
  tasks,
}: ProjectCardProps) {
  return (
    <Link to={`/dashboard/projects/${id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-7 w-7 border-2 border-white">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                  +{members.length - 3}
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              {tasks.completed}/{tasks.total} tasks
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 py-2 px-6 border-t text-xs text-gray-500">
          Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </CardFooter>
      </Card>
    </Link>
  );
}
