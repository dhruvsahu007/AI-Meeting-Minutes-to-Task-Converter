import { type Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const overdueTasks = tasks.filter(task => 
    task.status !== "completed" && 
    (task.dueDate.includes("Overdue") || task.dueDate.includes("20 June")) // Simple overdue detection
  ).length;
  const todayTasks = tasks.filter(task => 
    task.dueDate.includes("Today") || task.dueDate.includes("today")
  ).length;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: "fas fa-list-check",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-slate-900",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: "fas fa-check-circle",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: "fas fa-exclamation-triangle",
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-600",
    },
    {
      label: "Due Today",
      value: todayTasks,
      icon: "fas fa-clock",
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-600",
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.iconColor}`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
