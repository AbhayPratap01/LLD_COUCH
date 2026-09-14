import { Problem } from "../domain/Problem.js";
import { Submission } from "../domain/Submission.js";
import { EVALUATION_RUBRIC } from "./Rubric.js";
import { Evaluation } from "../domain/Evaluation.js";
import type { EvaluationCriterion } from "../domain/Evaluation.js";
import { AIPromptBuilder } from "./AIPromptBuilder.js";
import type { Evaluator } from "./Evaluator.js";
import type { AIClient } from "./AIClient.js";

interface AIResponseCriterion {
  name: string;
  score: number;
  evidence: string;
  concern: string;
  suggestion: string;
}

interface AIResponse {
  criteria: AIResponseCriterion[];
  strengths: string[];
  improvements: string[];
  summary: string;
  confidence: number;
}

export class AIEvaluator implements Evaluator {
  private readonly aiClient: AIClient;
private readonly promptBuilder: AIPromptBuilder;

constructor(
  aiClient: AIClient,
  promptBuilder: AIPromptBuilder = new AIPromptBuilder()
) {
  this.aiClient = aiClient;
  this.promptBuilder = promptBuilder;
}

  async evaluate(
    problem: Problem,
    submission: Submission,
    attemptId: string
  ): Promise<Evaluation> {
    const prompt = this.promptBuilder.build(problem, submission);

    const rawResponse = await this.aiClient.generateEvaluation(prompt);

    const parsedResponse = this.parseResponse(rawResponse);

    const criteria = this.validateCriteria(parsedResponse.criteria);

    return new Evaluation({
      id: crypto.randomUUID(),
      attemptId,
      overallScore: this.calculateScore(criteria),
      criteria,
      strengths: parsedResponse.strengths,
      improvements: parsedResponse.improvements,
      summary: parsedResponse.summary,
      confidence: parsedResponse.confidence,
      evaluatedAt: new Date()
    });
  }

  private parseResponse(rawResponse: string): AIResponse {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      throw new Error("AI evaluator returned invalid JSON.");
    }

    if (!this.isValidAIResponse(parsed)) {
      throw new Error("AI evaluator returned an invalid evaluation structure.");
    }

    return parsed;
  }

  private isValidAIResponse(value: unknown): value is AIResponse {
    if (!value || typeof value !== "object") {
      return false;
    }

    const response = value as Record<string, unknown>;

    return (
      Array.isArray(response.criteria) &&
      Array.isArray(response.strengths) &&
      Array.isArray(response.improvements) &&
      typeof response.summary === "string" &&
      typeof response.confidence === "number" &&
      response.confidence >= 0 &&
      response.confidence <= 1
    );
  }

  private validateCriteria(
    aiCriteria: AIResponseCriterion[]
  ): EvaluationCriterion[] {
    return EVALUATION_RUBRIC.map((rubricCriterion) => {
      const result = aiCriteria.find(
        (criterion) => criterion.name === rubricCriterion.name
      );

      if (!result) {
        throw new Error(
          `AI evaluator did not provide criterion: ${rubricCriterion.name}`
        );
      }

      if (
        typeof result.score !== "number" ||
        result.score < 0 ||
        result.score > rubricCriterion.weight
      ) {
        throw new Error(
          `Invalid score for criterion: ${rubricCriterion.name}`
        );
      }

      return {
        name: rubricCriterion.name,
        score: result.score,
        maxScore: rubricCriterion.weight,
        evidence: result.evidence,
        concern: result.concern,
        suggestion: result.suggestion
      };
    });
  }

  private calculateScore(criteria: EvaluationCriterion[]): number {
    return criteria.reduce(
      (total, criterion) => total + criterion.score,
      0
    );
  }
}