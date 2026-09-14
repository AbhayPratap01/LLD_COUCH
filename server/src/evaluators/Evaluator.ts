import { Problem } from "../domain/Problem.js";
import { Submission } from "../domain/Submission.js";
import { Evaluation } from "../domain/Evaluation.js";

export interface Evaluator {
  evaluate(
    problem: Problem,
    submission: Submission,
    attemptId: string
  ): Promise<Evaluation>;
}