import type { AIClient } from "./AIClient.js";

export class MockAIClient implements AIClient {
  async generateEvaluation(prompt: string): Promise<string> {
    const hasSubmissionContent =
      prompt.includes("Assumptions:") &&
      prompt.includes("Classes:") &&
      prompt.includes("Relationships:") &&
      prompt.includes("Design Reasoning:");

    if (!hasSubmissionContent) {
      throw new Error("Mock AI could not understand the submission.");
    }

    return JSON.stringify({
      criteria: [
        {
          name: "Submission Completeness",
          score: 10,
          evidence:
            "The learner provided assumptions, classes, relationships, and design reasoning.",
          concern: "",
          suggestion: ""
        },
        {
          name: "Requirement Understanding",
          score: 17,
          evidence:
            "The submission addresses the main functional requirements and explains how the design supports them.",
          concern:
            "Some requirements could be connected to specific design decisions more explicitly.",
          suggestion:
            "Explain how each major requirement maps to one or more domain objects."
        },
        {
          name: "Class Structure",
          score: 13,
          evidence:
            "The submission identifies several domain classes with reasonably focused responsibilities.",
          concern:
            "Some responsibilities could be separated further as the design grows.",
          suggestion:
            "Keep domain objects focused and avoid giving one class too many responsibilities."
        },
        {
          name: "Relationships",
          score: 12,
          evidence:
            "The submission describes relationships between the main domain objects.",
          concern:
            "Some relationships could be made more explicit.",
          suggestion:
            "Clearly state ownership, dependency, composition, or association between important classes."
        },
        {
          name: "Design Explanation",
          score: 4,
          evidence:
            "The learner provides reasoning for several design decisions.",
          concern:
            "Some decisions could use stronger justification.",
          suggestion:
            "Explain why the chosen abstractions are preferable and what trade-offs they introduce."
        }
      ],
      strengths: [
        "The solution identifies the core domain objects.",
        "The learner provides explicit design reasoning.",
        "The submission considers relationships between objects."
      ],
      improvements: [
        "Connect requirements more explicitly to design decisions.",
        "Explain important design trade-offs.",
        "Make relationships between major classes more precise."
      ],
      summary:
        "The design demonstrates a solid understanding of the core LLD concepts, with some opportunities to make requirements mapping and design trade-offs more explicit.",
      confidence: 0.82
    });
  }
}