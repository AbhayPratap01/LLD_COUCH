import { Problem } from "../domain/Problem.js";
import { Submission } from "../domain/Submission.js";
import { EVALUATION_RUBRIC } from "./Rubric.js";

export class AIPromptBuilder {
  build(problem: Problem, submission: Submission): string {
    const rubric = EVALUATION_RUBRIC.map(
      (criterion) =>
        `- ${criterion.name} (${criterion.weight} points): ${criterion.description}`
    ).join("\n");

    return `
You are an experienced software engineer evaluating a learner's
Low-Level Design (LLD) solution.

Your task is to provide constructive, evidence-based feedback.

IMPORTANT:
- There may be multiple valid LLD solutions.
- Do not compare the submission to one "correct" implementation.
- Evaluate the learner's reasoning and design decisions.
- Do not penalize a solution simply because it differs from a common solution.
- Base concerns on evidence from the submission.
- Do not invent classes or decisions that are not present.
- Return ONLY valid JSON.

PROBLEM

Title:
${problem.title}

Description:
${problem.description}

Requirements:
${problem.requirements.map((r) => `- ${r}`).join("\n")}

LEARNER SUBMISSION

Assumptions:
${submission.content.assumptions}

Classes:
${submission.content.classes}

Relationships:
${submission.content.relationships}

Design Reasoning:
${submission.content.reasoning}

EVALUATION RUBRIC

${rubric}

Return JSON using exactly this structure:

{
  "criteria": [
    {
      "name": "Requirement Understanding",
      "score": 0,
      "evidence": "Evidence from the learner submission",
      "concern": "Specific concern or empty string",
      "suggestion": "Actionable improvement or empty string"
    }
  ],
  "strengths": [
    "Specific strength supported by the submission"
  ],
  "improvements": [
    "Specific actionable improvement"
  ],
  "summary": "Short overall assessment",
  "confidence": 0.0
}

Rules:
- Each criterion score must be between 0 and its maximum weight.
- Include every rubric criterion exactly once.
- confidence must be between 0 and 1.
- Be concise and constructive.
`;
  }
}