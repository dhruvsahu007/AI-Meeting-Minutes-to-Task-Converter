import { TaskInput } from "@/components/task-input";
import { TaskBoard } from "@/components/task-board";
import { TaskStats } from "@/components/task-stats";
import { MeetingMinutes } from "@/components/meeting-minutes";
import { useQuery } from "@tanstack/react-query";
import { type Task } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("single");
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-tasks text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">TaskFlow AI</h1>
                <p className="text-xs text-slate-500">Enterprise Task Manager</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-bell"></i>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-cog"></i>
              </button>
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-slate-600 text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("single")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "single"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Single Task Input
            </button>
            <button
              onClick={() => setActiveTab("meeting")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "meeting"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Meeting Minutes Parser
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "single" && <TaskInput />}
        {activeTab === "meeting" && <MeetingMinutes />}
        
        <TaskBoard tasks={tasks} isLoading={isLoading} />
        <TaskStats tasks={tasks} />
      </main>
    </div>
  );
}
