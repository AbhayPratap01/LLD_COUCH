import { describe, expect, it } from "vitest";

import { Problem } from "../../domain/Problem.js";
import { Submission } from "../../domain/Submission.js";
import { AIEvaluator } from "../../evaluators/AIEvaluator.js";
import { AIClient } from "../../evaluators/AIClient.js";

const problem = new Problem({
  id: "parking-lot",
  title: "Parking Lot",
  slug: "parking-lot",
  difficulty: "medium",
  description: "Design a parking lot system.",
  requirements: [
    "Support multiple floors",
    "Support different vehicle types",
    "Assign appropriate parking spots",
    "Generate parking tickets",
    "Calculate parking fees"
  ],
  evaluationHints: []
});

const submission = new Submission({
  id: "submission-1",
  type: "text",
  content: {
    assumptions: "One vehicle occupies one parking spot.",
    classes: `
      Class: ParkingLot
      Class: Floor
      Class: ParkingSpot
      Class: Vehicle
      Class: ParkingTicket
      Interface: PricingStrategy
    `,
    relationships: `
      ParkingLot contains Floors
      Floor contains ParkingSpots
      Vehicle receives ParkingTicket
      ParkingLot uses PricingStrategy
    `,
    reasoning:
      "PricingStrategy allows pricing rules to change independently."
  }
});

const validAIResponse = {
  criteria: [
    {
      name: "Requirement Understanding",
      score: 18,
      evidence: "The design addresses the major parking requirements.",
      concern: "",
      suggestion: "Explicitly discuss vehicle type compatibility."
    },
    {
      name: "Responsibility Assignment",
      score: 17,
      evidence: "Parking responsibilities are separated across domain classes.",
      concern: "",
      suggestion: "Keep fee calculation outside ParkingLot."
    },
    {
      name: "Encapsulation & Abstraction",
      score: 13,
      evidence: "PricingStrategy provides a useful abstraction.",
      concern: "",
      suggestion: "Define the strategy contract clearly."
    },
    {
      name: "Coupling & Cohesion",
      score: 13,
      evidence: "The major responsibilities are reasonably separated.",
      concern: "",
      suggestion: "Avoid putting allocation logic into unrelated objects."
    },
    {
      name: "Extensibility",
      score: 13,
      evidence: "PricingStrategy supports future pricing changes.",
      concern: "",
      suggestion: "Consider extensibility for additional vehicle types."
    },
    {
      name: "Edge Cases & Testability",
      score: 8,
      evidence: "The design mentions basic assumptions.",
      concern: "Some edge cases are not described.",
      suggestion: "Consider a full lot and invalid vehicle/spot combinations."
    },
    {
      name: "Design Explanation",
      score: 4,
      evidence: "The reasoning explains the pricing abstraction.",
      concern: "",
      suggestion: "Explain two or three more important design decisions."
    }
  ],
  strengths: [
    "Clear domain decomposition",
    "Useful pricing abstraction"
  ],
  improvements: [
    "Discuss more edge cases",
    "Clarify vehicle and parking spot compatibility"
  ],
  summary: "A solid design with good separation of responsibilities.",
  confidence: 0.9
};

class MockAIClient implements AIClient {
  async generateEvaluation(_prompt: string): Promise<string> {
    return JSON.stringify(validAIResponse);
  }
}

class InvalidAIClient implements AIClient {
  async generateEvaluation(_prompt: string): Promise<string> {
    return "This is not valid JSON";
  }
}

describe("AIEvaluator", () => {
  it("converts a valid AI response into an Evaluation", async () => {
    const evaluator = new AIEvaluator(new MockAIClient());

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-1"
    );

    expect(evaluation.overallScore).toBe(86);
    expect(evaluation.criteria).toHaveLength(7);
    expect(evaluation.confidence).toBe(0.9);
  });

  it("rejects invalid AI JSON", async () => {
    const evaluator = new AIEvaluator(new InvalidAIClient());

    await expect(
      evaluator.evaluate(problem, submission, "attempt-2")
    ).rejects.toThrow(
      "AI evaluator returned invalid JSON."
    );
  });
});