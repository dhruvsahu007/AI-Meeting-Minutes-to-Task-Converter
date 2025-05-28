import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema, parseTaskSchema } from "@shared/schema";
import { parseNaturalLanguageTask } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get single task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Parse natural language and create task
  app.post("/api/tasks/parse", async (req, res) => {
    try {
      const validatedInput = parseTaskSchema.parse(req.body);
      
      // Parse natural language using OpenAI
      const parsedTask = await parseNaturalLanguageTask(validatedInput.input);
      
      // Create task from parsed data
      const taskData = {
        name: parsedTask.taskName,
        assignee: parsedTask.assignee,
        dueDate: parsedTask.dueDate,
        priority: parsedTask.priority,
        status: "pending" as const,
      };
      
      const validatedTask = insertTaskSchema.parse(taskData);
      const task = await storage.createTask(validatedTask);
      
      res.json(task);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to parse and create task" });
    }
  });

  // Create task manually
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedTask = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedTask);
      res.json(task);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedUpdates = updateTaskSchema.parse(req.body);
      
      const task = await storage.updateTask(id, validatedUpdates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
