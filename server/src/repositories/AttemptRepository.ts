import { Attempt } from "../domain/Attempt.js";

export interface AttemptRepository {
  findById(id: string): Promise<Attempt | null>;
  findByLearnerId(learnerId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<Attempt>;
}