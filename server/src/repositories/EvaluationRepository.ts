import { Evaluation } from "../domain/Evaluation.js";

export interface EvaluationRepository {
  findByAttemptId(attemptId: string): Promise<Evaluation | null>;
  save(evaluation: Evaluation): Promise<Evaluation>;
}