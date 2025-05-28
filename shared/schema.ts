import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  assignee: text("assignee").notNull(),
  dueDate: text("due_date").notNull(), // Store as formatted string for display
  priority: text("priority").notNull().default("P3"), // P1, P2, P3, P4
  status: text("status").notNull().default("pending"), // pending, in-progress, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const updateTaskSchema = insertTaskSchema.partial();

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Schema for natural language parsing input
export const parseTaskSchema = z.object({
  input: z.string().min(1, "Task input cannot be empty"),
});

export type ParseTaskInput = z.infer<typeof parseTaskSchema>;

// Schema for parsed task result from OpenAI
export const parsedTaskResultSchema = z.object({
  taskName: z.string(),
  assignee: z.string(),
  dueDate: z.string(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
});

export type ParsedTaskResult = z.infer<typeof parsedTaskResultSchema>;
