import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duration: integer("duration").notNull(),
  background: text("background").notNull(),
  soundscape: text("soundscape").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  completedAt: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;
