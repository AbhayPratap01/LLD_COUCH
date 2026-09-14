import { describe, expect, it } from "vitest";
import { RuleBasedEvaluator } from "../evaluators/RuleBasedEvaluator.js";
import type { Problem } from "../domain/Problem.js";
import type { Submission } from "../domain/Submission.js";

const problem = {
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
  ],
} as Problem;

function makeSubmission(
  content: Partial<Submission["content"]>
): Submission {
  const fullContent = {
    assumptions: content.assumptions ?? "",
    classes: content.classes ?? "",
    relationships: content.relationships ?? "",
    reasoning: content.reasoning ?? "",
  };

  return {
    content: fullContent,
    isComplete: () =>
      Object.values(fullContent).every(
        (value) => value.trim().length > 0
      ),
  } as Submission;
}

describe("RuleBasedEvaluator", () => {
  const evaluator = new RuleBasedEvaluator();

  it("detects classes described using natural-language responsibilities", async () => {
    const submission = makeSubmission({
      assumptions: "The parking lot has multiple floors.",
      classes: `
        ParkingLot: manages the overall parking facility.
        ParkingFloor: represents one floor and its spots.
        ParkingSpot: represents an individual parking space.
        Vehicle: represents a vehicle entering the lot.
        ParkingTicket: stores the active parking session.
      `,
      relationships: `
        ParkingLot contains ParkingFloor.
        ParkingFloor contains ParkingSpot.
        Vehicle is assigned to ParkingSpot.
        ParkingLot issues ParkingTicket.
      `,
      reasoning:
        "The design separates responsibilities into focused domain objects so that parking coordination, floor management, spot availability, vehicles, and tickets do not become one large class.",
    });

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-1"
    );

    const classCriterion = evaluation.criteria.find(
      (criterion) => criterion.name === "Class Structure"
    );

    expect(classCriterion?.score).toBe(15);
    expect(classCriterion?.evidence).toContain("ParkingLot");
    expect(classCriterion?.evidence).toContain("Vehicle");
    expect(classCriterion?.evidence).toContain("ParkingTicket");
  });

  it("detects explicitly declared classes and interfaces", async () => {
    const submission = makeSubmission({
      assumptions: "The system supports multiple vehicle types.",
      classes: `
        class ParkingLot
        class ParkingFloor
        class ParkingSpot
        class Vehicle
        interface ParkingStrategy
      `,
      relationships: `
        ParkingLot contains ParkingFloor.
        ParkingFloor contains ParkingSpot.
        Vehicle is assigned to ParkingSpot.
      `,
      reasoning:
        "Separate domain classes keep responsibilities focused and allow the allocation strategy to change independently.",
    });

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-2"
    );

    const classCriterion = evaluation.criteria.find(
      (criterion) => criterion.name === "Class Structure"
    );

    expect(classCriterion?.score).toBe(15);
  });

  it("gives a lower class-structure score when too few domain objects are provided", async () => {
    const submission = makeSubmission({
      assumptions: "The system has one parking area.",
      classes: "ParkingLot: manages the parking area.",
      relationships: "ParkingLot manages all parking operations.",
      reasoning:
        "The initial design keeps the implementation simple.",
    });

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-3"
    );

    const classCriterion = evaluation.criteria.find(
      (criterion) => criterion.name === "Class Structure"
    );

    expect(classCriterion?.score).toBe(7);
    expect(classCriterion?.concern).toBeTruthy();
  });

  it("recognizes relationship statements written as prose", async () => {
    const submission = makeSubmission({
      assumptions: "Vehicles can occupy one spot at a time.",
      classes: `
        ParkingLot: manages the facility.
        ParkingFloor: represents a floor.
        ParkingSpot: represents a spot.
      `,
      relationships: `
        ParkingLot contains multiple ParkingFloors.
        ParkingFloor contains multiple ParkingSpots.
        Vehicle is assigned to a ParkingSpot.
        ParkingLot issues ParkingTickets.
        ParkingTicket belongs to a Vehicle.
      `,
      reasoning:
        "The relationships keep ownership and responsibility explicit.",
    });

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-4"
    );

    const relationshipCriterion = evaluation.criteria.find(
      (criterion) => criterion.name === "Relationships"
    );

    expect(relationshipCriterion?.score).toBe(15);
    expect(relationshipCriterion?.evidence).toContain(
      "5 relationship"
    );
  });

  it("reports incomplete submissions instead of evaluating them as complete", async () => {
    const submission = makeSubmission({
      assumptions: "The system supports multiple floors.",
      classes: "",
      relationships: "ParkingLot contains ParkingFloor.",
      reasoning: "The design separates responsibilities.",
    });

    const evaluation = await evaluator.evaluate(
      problem,
      submission,
      "attempt-5"
    );

    const completenessCriterion = evaluation.criteria.find(
      (criterion) =>
        criterion.name === "Submission Completeness"
    );

    expect(completenessCriterion?.score).toBe(0);
    expect(completenessCriterion?.concern).toContain(
      "cannot reliably assess"
    );
  });
});