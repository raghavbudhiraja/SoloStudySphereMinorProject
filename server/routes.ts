import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Goals endpoints
  app.get("/api/goals", async (_req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid goal data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create goal" });
      }
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const goal = await storage.updateGoal(id, updates);
      if (!goal) {
        res.status(404).json({ error: "Goal not found" });
        return;
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGoal(id);
      
      if (!deleted) {
        res.status(404).json({ error: "Goal not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Study Sessions endpoints
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create session" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
