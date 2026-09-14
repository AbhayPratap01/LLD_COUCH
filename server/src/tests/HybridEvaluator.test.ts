import { describe, expect, it, vi } from "vitest";
import type { Evaluation } from "../domain/Evaluation.js";
import type { Problem } from "../domain/Problem.js";
import type { Submission } from "../domain/Submission.js";
import type { Evaluator } from "../evaluators/Evaluator.js";
import { HybridEvaluator } from "../evaluators/HybridEvaluator.js";

const problem = {} as Problem;
const submission = {} as Submission;

function makeEvaluation(
  score: number
): Evaluation {
  return {
    id: `evaluation-${score}`,
    attemptId: "attempt-1",
    overallScore: score,
    criteria: [],
    strengths: [],
    improvements: [],
    summary: "Test evaluation",
    confidence: 1,
    evaluatedAt: new Date(),
  } as Evaluation;
}

describe("HybridEvaluator", () => {
  it("uses the rule-based evaluator when no AI evaluator is configured", async () => {
    const ruleBasedEvaluator: Evaluator = {
      evaluate: vi.fn().mockResolvedValue(
        makeEvaluation(72)
      ),
    };

    const hybridEvaluator =
      new HybridEvaluator(ruleBasedEvaluator);

    const result =
      await hybridEvaluator.evaluate(
        problem,
        submission,
        "attempt-1"
      );

    expect(result.overallScore).toBe(72);
    expect(
      ruleBasedEvaluator.evaluate
    ).toHaveBeenCalledOnce();
  });

  it("returns the AI evaluation when AI succeeds", async () => {
    const ruleBasedEvaluator: Evaluator = {
      evaluate: vi.fn().mockResolvedValue(
        makeEvaluation(72)
      ),
    };

    const aiEvaluator: Evaluator = {
      evaluate: vi.fn().mockResolvedValue(
        makeEvaluation(86)
      ),
    };

    const hybridEvaluator =
      new HybridEvaluator(
        ruleBasedEvaluator,
        aiEvaluator
      );

    const result =
      await hybridEvaluator.evaluate(
        problem,
        submission,
        "attempt-1"
      );

    expect(result.overallScore).toBe(86);
  });

  it("falls back to rule-based evaluation when AI fails", async () => {
    const ruleBasedEvaluator: Evaluator = {
      evaluate: vi.fn().mockResolvedValue(
        makeEvaluation(72)
      ),
    };

    const aiEvaluator: Evaluator = {
      evaluate: vi.fn().mockRejectedValue(
        new Error("AI service unavailable")
      ),
    };

    const hybridEvaluator =
      new HybridEvaluator(
        ruleBasedEvaluator,
        aiEvaluator
      );

    const result =
      await hybridEvaluator.evaluate(
        problem,
        submission,
        "attempt-1"
      );

    expect(result.overallScore).toBe(72);

    expect(
      aiEvaluator.evaluate
    ).toHaveBeenCalledOnce();

    expect(
      ruleBasedEvaluator.evaluate
    ).toHaveBeenCalledOnce();
  });
});