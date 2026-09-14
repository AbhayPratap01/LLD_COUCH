import { describe, expect, it } from "vitest";

import { Attempt } from "../../domain/Attempt.js";
import { Submission } from "../../domain/Submission.js";
import { Evaluation } from "../../domain/Evaluation.js";

function createSubmission(): Submission {
  return new Submission({
    id: "submission-1",
    type: "text",
    content: {
      assumptions: "One vehicle occupies one parking spot.",
      classes: "ParkingLot, Floor, ParkingSpot, Vehicle.",
      relationships: "ParkingLot contains Floors.",
      reasoning:
        "Parking management and pricing should remain separate."
    }
  });
}

function createAttempt(): Attempt {
  return new Attempt({
    id: "attempt-1",
    learnerId: "learner-1",
    problemId: "parking-lot"
  });
}

function createEvaluation(): Evaluation {
  return new Evaluation({
    id: "evaluation-1",
    attemptId: "attempt-1",
    overallScore: 82,
    criteria: [],
    strengths: ["Clear responsibilities"],
    improvements: ["Consider more edge cases"],
    summary: "Good overall design.",
    confidence: 0.9,
    evaluatedAt: new Date()
  });
}

describe("Attempt", () => {
  it("starts in draft status", () => {
    const attempt = createAttempt();

    expect(attempt.status).toBe("draft");
  });

  it("allows a submission to be attached to a draft attempt", () => {
    const attempt = createAttempt();
    const submission = createSubmission();

    attempt.attachSubmission(submission);

    expect(attempt.submission).toBe(submission);
  });

  it("rejects an incomplete submission", () => {
    const attempt = createAttempt();

    const submission = new Submission({
      id: "submission-1",
      type: "text",
      content: {
        assumptions: "",
        classes: "ParkingLot",
        relationships: "ParkingLot contains Floor",
        reasoning: "Simple design"
      }
    });

    attempt.attachSubmission(submission);

    expect(() => attempt.submit()).toThrow(
      "Submission is incomplete."
    );
  });

  it("allows a complete submission", () => {
    const attempt = createAttempt();

    attempt.attachSubmission(createSubmission());
    attempt.submit();

    expect(attempt.status).toBe("submitted");
    expect(attempt.submittedAt).toBeInstanceOf(Date);
  });

  it("does not allow evaluation before submission", () => {
    const attempt = createAttempt();

    expect(() => attempt.startEvaluation()).toThrow(
      "Only submitted attempts can be evaluated."
    );
  });

  it("moves a submitted attempt into evaluation", () => {
    const attempt = createAttempt();

    attempt.attachSubmission(createSubmission());
    attempt.submit();
    attempt.startEvaluation();

    expect(attempt.status).toBe("evaluating");
  });

  it("completes an evaluation", () => {
    const attempt = createAttempt();

    attempt.attachSubmission(createSubmission());
    attempt.submit();
    attempt.startEvaluation();

    const evaluation = createEvaluation();

    attempt.completeEvaluation(evaluation);

    expect(attempt.status).toBe("completed");
    expect(attempt.evaluation).toBe(evaluation);
  });

  it("can mark an evaluation as failed", () => {
    const attempt = createAttempt();

    attempt.attachSubmission(createSubmission());
    attempt.submit();
    attempt.startEvaluation();

    attempt.failEvaluation();

    expect(attempt.status).toBe("failed");
  });

  it("does not allow a draft attempt to be evaluated directly", () => {
    const attempt = createAttempt();

    expect(() =>
      attempt.completeEvaluation(createEvaluation())
    ).toThrow(
      "Attempt is not currently being evaluated."
    );
  });
});