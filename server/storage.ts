import { type Goal, type InsertGoal, type StudySession, type InsertStudySession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Study Sessions
  getSessions(): Promise<StudySession[]>;
  createSession(session: InsertStudySession): Promise<StudySession>;
}

export class MemStorage implements IStorage {
  private goals: Map<string, Goal>;
  private sessions: Map<string, StudySession>;

  constructor() {
    this.goals = new Map();
    this.sessions = new Map();
  }

  // Goals methods
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values()).sort((a, b) => a.order - b.order);
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      id,
      ...insertGoal,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Study Sessions methods
  async getSessions(): Promise<StudySession[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  async createSession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = randomUUID();
    const session: StudySession = {
      id,
      ...insertSession,
      completedAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
