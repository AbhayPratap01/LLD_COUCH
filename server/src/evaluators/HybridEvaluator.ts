import type { Problem } from "../domain/Problem.js";
import type { Submission } from "../domain/Submission.js";
import type { Evaluation } from "../domain/Evaluation.js";
import type { Evaluator } from "./Evaluator.js";

export class HybridEvaluator implements Evaluator {
  private readonly ruleBasedEvaluator: Evaluator;
  private readonly aiEvaluator?: Evaluator;

  constructor(
    ruleBasedEvaluator: Evaluator,
    aiEvaluator?: Evaluator
  ) {
    this.ruleBasedEvaluator = ruleBasedEvaluator;
    this.aiEvaluator = aiEvaluator;
  }

  async evaluate(
    problem: Problem,
    submission: Submission,
    attemptId: string
  ): Promise<Evaluation> {
    const ruleBasedEvaluation =
      await this.ruleBasedEvaluator.evaluate(
        problem,
        submission,
        attemptId
      );

    if (!this.aiEvaluator) {
      return ruleBasedEvaluation;
    }

    try {
      return await this.aiEvaluator.evaluate(
        problem,
        submission,
        attemptId
      );
    } catch {
      console.warn(
        "AI evaluation failed. Falling back to rule-based evaluation."
      );

      return ruleBasedEvaluation;
    }
  }
}