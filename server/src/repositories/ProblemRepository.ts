import { Problem } from "../domain/Problem.js";

export interface ProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
  save(problem: Problem): Promise<Problem>;
}