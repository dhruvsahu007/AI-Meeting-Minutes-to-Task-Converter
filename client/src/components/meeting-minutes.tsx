import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { type Task } from "@shared/schema";

export function MeetingMinutes() {
  const [transcript, setTranscript] = useState("");
  const [lastParsedTasks, setLastParsedTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseTranscriptMutation = useMutation({
    mutationFn: async (transcriptInput: string) => {
      const res = await apiRequest("POST", "/api/tasks/parse-transcript", { transcript: transcriptInput });
      return res.json() as Promise<{ tasks: Task[]; count: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setLastParsedTasks(data.tasks);
      setTranscript("");
      toast({
        title: "Meeting parsed successfully",
        description: `${data.count} tasks extracted and added to your task list.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to parse meeting",
        description: error.message || "Please try again with a different transcript.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!transcript.trim()) {
      toast({
        title: "Empty transcript",
        description: "Please enter a meeting transcript.",
        variant: "destructive",
      });
      return;
    }
    parseTranscriptMutation.mutate(transcript.trim());
  };

  const handleClear = () => {
    setTranscript("");
    setLastParsedTasks([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1": return "bg-red-100 text-red-800 border-red-200";
      case "P2": return "bg-amber-100 text-amber-800 border-amber-200";
      case "P3": return "bg-blue-100 text-blue-800 border-blue-200";
      case "P4": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
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

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-purple-600"></i>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-slate-900">
                AI Meeting Minutes to Task Converter
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Paste your entire meeting transcript and AI will automatically extract all tasks and assignments
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here...

Example:
'Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday. Shreya please review the marketing deck tonight.'"
              className="resize-none min-h-[120px]"
              rows={6}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">
                <i className="fas fa-brain text-purple-500"></i>
                AI will extract all tasks, assignees, and deadlines
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={parseTranscriptMutation.isPending}
              >
                Clear
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={parseTranscriptMutation.isPending || !transcript.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {parseTranscriptMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Extract Tasks
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing State */}
      {parseTranscriptMutation.isPending && (
        <Card className="shadow-card border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Processing meeting transcript...</p>
                <p className="text-xs text-slate-600">AI is analyzing the text and extracting tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Preview */}
      {lastParsedTasks.length > 0 && !parseTranscriptMutation.isPending && (
        <Card className="shadow-card border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600"></i>
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Successfully Extracted {lastParsedTasks.length} Tasks
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    All tasks have been added to your task board
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Latest Extraction
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {lastParsedTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{task.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due: {task.dueDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getAvatarColor(task.assignee)}`}>
                        <span className="text-xs font-medium">{task.assignee.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-slate-700">{task.assignee}</span>
                    </div>
                    
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Section */}
      <Card className="shadow-card bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base font-medium text-slate-700 flex items-center">
            <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
            Example Meeting Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 italic leading-relaxed">
              "Alright team, let's assign the action items from today's meeting. 
              Aman you take the landing page by 10pm tomorrow. 
              Rajeev you take care of client follow-up by Wednesday. 
              Shreya please review the marketing deck tonight. 
              Also, John needs to prepare the P1 presentation slides by Friday morning. 
              Sarah, can you update the project timeline by end of week?"
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            This example would extract 5 tasks with proper assignees and deadlines
          </p>
        </CardContent>
      </Card>
    </div>
  );
}