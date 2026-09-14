import { describe, expect, it } from "vitest";

import { Problem } from "../../domain/Problem.js";
import { Submission } from "../../domain/Submission.js";
import { RuleBasedEvaluator } from "../../evaluators/RuleBasedEvaluator.js";

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

function createGoodSubmission(): Submission {
  return new Submission({
    id: "submission-1",
    type: "text",
    content: {
      assumptions: `
        A vehicle occupies one parking spot.
        Each parking floor contains multiple parking spots.
      `,

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
        ParkingSpot is assigned to Vehicle
        Vehicle receives ParkingTicket
        ParkingLot uses PricingStrategy
      `,

      reasoning: `
        ParkingLot manages the overall parking facility while Floor
        manages its own spots. PricingStrategy is an interface because
        pricing rules may change independently from parking allocation.
        Different vehicle types can be represented using polymorphism.
        This keeps responsibilities focused and makes the design easier
        to extend and test.
      `
    }
  });
}

describe("RuleBasedEvaluator", () => {
  it("evaluates a structured submission", async () => {
    const evaluator = new RuleBasedEvaluator();

    const evaluation = await evaluator.evaluate(
      problem,
      createGoodSubmission(),
      "attempt-1"
    );

    expect(evaluation).toBeDefined();
    expect(evaluation.overallScore).toBeGreaterThan(0);
    expect(evaluation.criteria.length).toBeGreaterThan(0);
    expect(evaluation.confidence).toBe(1);
  });

  it("detects an incomplete submission", async () => {
    const evaluator = new RuleBasedEvaluator();

    const submission = new Submission({
      id: "submission-2",
      type: "text",
      content: {
        assumptions: "",
        classes: "",
        relationships: "",
        reasoning: ""
      }
    });

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-2"
    );

    const completeness = evaluation.criteria.find(
      (criterion) => criterion.name === "Submission Completeness"
    );

    expect(completeness?.score).toBe(0);
  });
});