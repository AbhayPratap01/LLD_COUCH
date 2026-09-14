export interface RubricCriterion {
  name: string;
  weight: number;
  description: string;
}

export const EVALUATION_RUBRIC: RubricCriterion[] = [
  {
    name: "Requirement Understanding",
    weight: 20,
    description:
      "How well the solution addresses the stated problem requirements."
  },
  {
    name: "Responsibility Assignment",
    weight: 20,
    description:
      "How clearly responsibilities are assigned to appropriate classes."
  },
  {
    name: "Encapsulation & Abstraction",
    weight: 15,
    description:
      "Quality of interfaces, abstractions, information hiding and boundaries."
  },
  {
    name: "Coupling & Cohesion",
    weight: 15,
    description:
      "Whether classes have focused responsibilities and manageable dependencies."
  },
  {
    name: "Extensibility",
    weight: 15,
    description:
      "How well the design can accommodate reasonable future changes."
  },
  {
    name: "Edge Cases & Testability",
    weight: 10,
    description:
      "Consideration of edge cases and whether the design is easy to test."
  },
  {
    name: "Design Explanation",
    weight: 5,
    description:
      "Clarity of assumptions and reasoning behind important design decisions."
  }
];