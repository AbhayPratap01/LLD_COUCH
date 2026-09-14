import { Problem } from "../domain/Problem.js";
import { Evaluation } from "../domain/Evaluation.js";
import type { EvaluationCriterion } from "../domain/Evaluation.js";
import { Submission } from "../domain/Submission.js";
import type { Evaluator } from "./Evaluator.js";

export class RuleBasedEvaluator implements Evaluator {
  async evaluate(
    problem: Problem,
    submission: Submission,
    attemptId: string
  ): Promise<Evaluation> {
    const criteria: EvaluationCriterion[] = [];

    this.evaluateCompleteness(submission, criteria);
    this.evaluateRequirements(problem, submission, criteria);
    this.evaluateClassStructure(submission, criteria);
    this.evaluateRelationships(submission, criteria);
    this.evaluateReasoning(submission, criteria);

    const overallScore = this.calculateScore(criteria);

    return new Evaluation({
      id: crypto.randomUUID(),
      attemptId,
      overallScore,
      criteria,
      strengths: this.getStrengths(criteria),
      improvements: this.getImprovements(criteria),
      summary: this.generateSummary(overallScore),
      confidence: 1,
      evaluatedAt: new Date(),
    });
  }

  private evaluateCompleteness(
    submission: Submission,
    criteria: EvaluationCriterion[]
  ): void {
    const complete = submission.isComplete();

    criteria.push({
      name: "Submission Completeness",
      score: complete ? 10 : 0,
      maxScore: 10,
      evidence: complete
        ? "All required submission sections are present."
        : "One or more required submission sections are empty.",
      concern: complete
        ? ""
        : "The evaluator cannot reliably assess the design without all sections.",
      suggestion: complete
        ? ""
        : "Complete the assumptions, classes, relationships, and reasoning sections.",
    });
  }

  private evaluateRequirements(
    problem: Problem,
    submission: Submission,
    criteria: EvaluationCriterion[]
  ): void {
    const combinedContent = [
      submission.content.assumptions,
      submission.content.classes,
      submission.content.relationships,
      submission.content.reasoning,
    ]
      .join(" ")
      .toLowerCase();

    const matchedRequirements = problem.requirements.filter((requirement) => {
      const keywords = requirement
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9]/g, ""))
        .filter((word) => word.length > 3);

      if (keywords.length === 0) {
        return false;
      }

      /*
       * A requirement is considered potentially addressed when at least
       * one meaningful keyword from the requirement appears in the
       * learner's submission.
       *
       * This is intentionally lightweight because a rule-based evaluator
       * should provide signals, not pretend to understand every valid
       * design.
       */
      return keywords.some((keyword) =>
        combinedContent.includes(keyword)
      );
    });

    const percentage =
      problem.requirements.length === 0
        ? 0
        : matchedRequirements.length / problem.requirements.length;

    const score = Math.round(percentage * 20);

    criteria.push({
      name: "Requirement Understanding",
      score,
      maxScore: 20,
      evidence: `Potentially addressed ${matchedRequirements.length} of ${problem.requirements.length} stated requirements.`,
      concern:
        score < 14
          ? "Several problem requirements may not be explicitly addressed."
          : "",
      suggestion:
        score < 14
          ? "Review each requirement and explicitly explain how your design handles it."
          : "",
    });
  }

  private evaluateClassStructure(
    submission: Submission,
    criteria: EvaluationCriterion[]
  ): void {
    const classText = submission.content.classes.trim();

    /*
     * LLD answers can describe classes in several valid ways.
     *
     * Supported examples:
     *
     *   class ParkingLot
     *   interface PaymentStrategy
     *   ParkingLot: manages parking spaces
     *   Vehicle - represents a vehicle
     *   ParkingSpot -> represents an individual parking spot
     *
     * We therefore do not require the learner to use a specific syntax.
     */

    const declaredClasses =
      classText.match(
        /\b(?:class|interface)\s+([A-Z][A-Za-z0-9_]*)\b/g
      ) ?? [];

    const describedClasses =
      classText.match(
        /\b([A-Z][A-Za-z0-9_]{2,})\s*[:\-–—]\s*(?:represents|manages|handles|stores|tracks|contains|controls|provides|defines|coordinates|models|encapsulates)\b/gi
      ) ?? [];

    const responsibilityStatements =
      classText.match(
        /\b([A-Z][A-Za-z0-9_]{2,})\s+(?:represents|manages|handles|stores|tracks|contains|controls|provides|defines|coordinates|models|encapsulates)\b/gi
      ) ?? [];

    const explicitNames = this.extractClassNames(declaredClasses);
    const describedNames = this.extractClassNames(describedClasses);
    const responsibilityNames =
      this.extractClassNames(responsibilityStatements);

    const allClassNames = new Set([
      ...explicitNames,
      ...describedNames,
      ...responsibilityNames,
    ]);

    /*
     * Also recognise common LLD naming patterns such as:
     *
     *   ParkingLot
     *   ParkingSpot
     *   Vehicle
     *   ElevatorController
     *
     * when they appear as standalone capitalized domain concepts.
     *
     * We only consider names containing a domain-style suffix/prefix,
     * avoiding counting every capitalized English word as a class.
     */
    const domainConceptMatches =
      classText.match(
        /\b[A-Z][A-Za-z0-9_]*(?:Manager|Controller|Service|Factory|Strategy|Repository|RepositoryImpl|Handler|Policy|Builder|Provider|Vehicle|Spot|Lot|Floor|Elevator|Ticket|Payment|User|Expense|Product|Machine|Order|Item)\b/g
      ) ?? [];

    domainConceptMatches.forEach((name) => {
      allClassNames.add(name);
    });

    const classCount = allClassNames.size;

    let score = 0;

    if (classCount >= 5) {
      score = 15;
    } else if (classCount >= 3) {
      score = 12;
    } else if (classCount >= 1) {
      score = 7;
    }

    const detectedNames = Array.from(allClassNames);

    criteria.push({
      name: "Class Structure",
      score,
      maxScore: 15,
      evidence:
        classCount > 0
          ? `Detected approximately ${classCount} domain classes or interfaces: ${detectedNames.join(", ")}.`
          : "No clear domain classes or interfaces were detected in the class description.",
      concern:
        classCount < 3
          ? "The solution may not provide enough explicit domain objects for meaningful LLD evaluation."
          : "",
      suggestion:
        classCount < 3
          ? "Identify the main domain objects and assign each a focused responsibility. Natural-language descriptions are acceptable."
          : "",
    });
  }

  private extractClassNames(matches: string[]): string[] {
    const names: string[] = [];

    for (const match of matches) {
      const explicitDeclaration = match.match(
        /\b(?:class|interface)\s+([A-Z][A-Za-z0-9_]*)\b/
      );

      if (explicitDeclaration?.[1]) {
        names.push(explicitDeclaration[1]);
        continue;
      }

      const responsibilityStatement = match.match(
        /\b([A-Z][A-Za-z0-9_]{2,})\b/
      );

      if (responsibilityStatement?.[1]) {
        names.push(responsibilityStatement[1]);
      }
    }

    return names;
  }

  private evaluateRelationships(
    submission: Submission,
    criteria: EvaluationCriterion[]
  ): void {
    const relationshipText = submission.content.relationships.trim();

    const relationshipLines = relationshipText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    /*
     * Besides line-based relationships, recognise common relationship
     * notation inside prose.
     *
     * Examples:
     *   ParkingLot has many ParkingSpots
     *   Vehicle is assigned to ParkingSpot
     *   ElevatorController manages Elevator
     *   PaymentStrategy -> implemented by CardPayment
     */
    const proseRelationshipMatches =
      relationshipText.match(
        /\b(?:has|have|contains|owns|uses|depends on|manages|controls|contains|assigns|assigned to|composes|extends|implements|inherits from|belongs to|associated with)\b/gi
      ) ?? [];

    const relationshipCount = Math.max(
      relationshipLines.length,
      proseRelationshipMatches.length
    );

    const score = Math.min(15, relationshipCount * 3);

    criteria.push({
      name: "Relationships",
      score,
      maxScore: 15,
      evidence: `Found approximately ${relationshipCount} relationship statements.`,
      concern:
        relationshipCount < 3
          ? "The relationships between domain objects may not be sufficiently explained."
          : "",
      suggestion:
        relationshipCount < 3
          ? "Explain how the main classes interact, compose, depend on, or inherit from one another."
          : "",
    });
  }

  private evaluateReasoning(
    submission: Submission,
    criteria: EvaluationCriterion[]
  ): void {
    const reasoningLength = submission.content.reasoning.trim().length;

    let score = 0;

    if (reasoningLength >= 500) {
      score = 5;
    } else if (reasoningLength >= 250) {
      score = 4;
    } else if (reasoningLength >= 100) {
      score = 3;
    } else if (reasoningLength > 0) {
      score = 1;
    }

    criteria.push({
      name: "Design Explanation",
      score,
      maxScore: 5,
      evidence: `Design reasoning contains approximately ${reasoningLength} characters.`,
      concern:
        score < 3
          ? "The reasoning does not provide enough evidence for evaluating design decisions."
          : "",
      suggestion:
        score < 3
          ? "Explain why important abstractions and responsibilities were chosen."
          : "",
    });
  }

  private calculateScore(
    criteria: EvaluationCriterion[]
  ): number {
    const earned = criteria.reduce(
      (total, criterion) => total + criterion.score,
      0
    );

    const possible = criteria.reduce(
      (total, criterion) => total + criterion.maxScore,
      0
    );

    if (possible === 0) {
      return 0;
    }

    return Math.round((earned / possible) * 100);
  }

  private getStrengths(
    criteria: EvaluationCriterion[]
  ): string[] {
    return criteria
      .filter(
        (criterion) =>
          criterion.score >= criterion.maxScore * 0.8
      )
      .map((criterion) => criterion.name);
  }

  private getImprovements(
    criteria: EvaluationCriterion[]
  ): string[] {
    return criteria
      .filter(
        (criterion) =>
          criterion.score < criterion.maxScore * 0.6
      )
      .map((criterion) => criterion.suggestion)
      .filter(Boolean);
  }

  private generateSummary(score: number): string {
    if (score >= 85) {
      return "Strong structured submission with good coverage of the basic evaluation checks.";
    }

    if (score >= 70) {
      return "Good starting design with some areas that could be strengthened.";
    }

    if (score >= 50) {
      return "The submission covers some fundamentals but needs improvement in several areas.";
    }

    return "The submission needs more detail before the design can be evaluated reliably.";
  }
}