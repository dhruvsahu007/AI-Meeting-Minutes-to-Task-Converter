import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type Task } from "@shared/schema";

export function TaskInput() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseTaskMutation = useMutation({
    mutationFn: async (taskInput: string) => {
      const res = await apiRequest("POST", "/api/tasks/parse", { input: taskInput });
      return res.json() as Promise<Task>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setInput("");
      toast({
        title: "Task created successfully",
        description: "Your task has been parsed and added to the list.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message || "Please try again with a different description.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter a task description.",
        variant: "destructive",
      });
      return;
    }
    parseTaskMutation.mutate(input.trim());
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <i className="fas fa-magic text-blue-600"></i>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Add Task with Natural Language</h2>
          <p className="text-sm text-slate-600 mb-4">
            Type naturally like "Finish landing page Aman by 11pm 20th June" or "Call client Rajeev tomorrow 5pm"
          </p>
          
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your task in natural language..."
              className="resize-none"
              rows={3}
            />
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">
                  <i className="fas fa-lightbulb text-amber-500"></i>
                  AI will automatically parse task details
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={parseTaskMutation.isPending}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={parseTaskMutation.isPending || !input.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {parseTaskMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus-circle mr-2"></i>
                      Add Task
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {parseTaskMutation.isPending && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-sm text-slate-600">Processing your task with AI...</span>
          </div>
        </div>
      )}
    </div>
  );
}
