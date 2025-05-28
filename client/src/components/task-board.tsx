import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EditTaskDialog } from "./edit-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { type Task } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
}

export function TaskBoard({ tasks, isLoading }: TaskBoardProps) {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete task",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return res.json() as Promise<Task>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    return true;
  });

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleToggleComplete = (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({
      id: task.id,
      updates: { status: newStatus },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1": return "bg-red-100 text-red-800";
      case "P2": return "bg-amber-100 text-amber-800";
      case "P3": return "bg-blue-100 text-blue-800";
      case "P4": return "bg-slate-100 text-slate-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-slate-400";
      case "pending": return "bg-green-500";
      case "in-progress": return "bg-amber-500";
      default: return "bg-slate-400";
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-indigo-100 text-indigo-700",
      "bg-purple-100 text-purple-700",
      "bg-green-100 text-green-700",
      "bg-blue-100 text-blue-700",
      "bg-pink-100 text-pink-700",
      "bg-yellow-100 text-yellow-700",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-200 rounded"></div>
            <div className="h-12 bg-slate-200 rounded"></div>
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium text-slate-700">Filter & Sort</h3>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="P1">P1 - Critical</SelectItem>
                <SelectItem value="P2">P2 - High</SelectItem>
                <SelectItem value="P3">P3 - Normal</SelectItem>
                <SelectItem value="P4">P4 - Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <i className="fas fa-list"></i>
            </button>
            <button className="p-2 text-slate-600 bg-slate-100 rounded transition-colors">
              <i className="fas fa-th"></i>
            </button>
            <div className="border-l border-slate-300 pl-2 ml-2">
              <span className="text-sm text-slate-500">{filteredTasks.length} tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Your Tasks</h2>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tasks text-slate-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
            <p className="text-slate-600 mb-4">Start by adding your first task using natural language above.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-700">
              <div className="col-span-1">
                <Checkbox />
              </div>
              <div className="col-span-5">Task</div>
              <div className="col-span-2">Assigned To</div>
              <div className="col-span-2">Due Date/Time</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => handleToggleComplete(task)}
                    />
                  </div>
                  <div className="col-span-5 flex items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                      <div>
                        <p className={`font-medium ${task.status === "completed" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                          {task.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getAvatarColor(task.assignee)}`}>
                        <span className="text-xs font-medium">{task.assignee.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className={`text-sm ${task.status === "completed" ? "text-slate-500" : "text-slate-700"}`}>
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p className={`text-sm font-medium ${task.status === "completed" ? "text-slate-500" : "text-slate-900"}`}>
                        {task.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mono font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingTask(task)}
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:text-red-600"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deleteTaskMutation.isPending}
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
