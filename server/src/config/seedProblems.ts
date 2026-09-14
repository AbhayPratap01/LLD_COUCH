import { Problem } from "../domain/Problem.js";
import { MongoProblemRepository } from "../repositories/MongoProblemRepository.js";

const problems = [
  new Problem({
    id: "parking-lot",
    title: "Parking Lot",
    slug: "parking-lot",
    difficulty: "medium",
    description:
      "Design a parking lot system that can manage multiple floors, vehicle types, parking spots, tickets, and parking fees.",
    requirements: [
      "Support multiple floors",
      "Support different vehicle types",
      "Assign appropriate parking spots",
      "Generate parking tickets",
      "Calculate parking fees"
    ],
    evaluationHints: [
      {
        criterion: "Responsibility Assignment",
        description:
          "Look for focused responsibilities across parking, vehicles, tickets, and pricing."
      },
      {
        criterion: "Extensibility",
        description:
          "Consider whether new vehicle types or pricing strategies can be added."
      }
    ]
  }),

  new Problem({
    id: "elevator-system",
    title: "Elevator System",
    slug: "elevator-system",
    difficulty: "medium",
    description:
      "Design an elevator system that manages multiple elevators and responds to floor requests efficiently.",
    requirements: [
      "Support multiple elevators",
      "Accept internal floor requests",
      "Accept external up/down requests",
      "Track elevator state",
      "Assign requests to elevators"
    ],
    evaluationHints: [
      {
        criterion: "Responsibility Assignment",
        description:
          "Separate elevator state, request handling, and scheduling responsibilities."
      },
      {
        criterion: "Extensibility",
        description:
          "Consider whether scheduling strategies can evolve independently."
      }
    ]
  }),

  new Problem({
    id: "vending-machine",
    title: "Vending Machine",
    slug: "vending-machine",
    difficulty: "easy",
    description:
      "Design a vending machine that accepts money, allows product selection, dispenses products, and returns change.",
    requirements: [
      "Display available products",
      "Accept money",
      "Allow product selection",
      "Dispense products",
      "Return change",
      "Handle unavailable products"
    ],
    evaluationHints: [
      {
        criterion: "Encapsulation & Abstraction",
        description:
          "Consider how machine state and payment behavior are modeled."
      }
    ]
  }),

  new Problem({
    id: "splitwise",
    title: "Splitwise",
    slug: "splitwise",
    difficulty: "medium",
    description:
      "Design an expense sharing system where users can create expenses and track balances between participants.",
    requirements: [
      "Support multiple users",
      "Create shared expenses",
      "Support different split types",
      "Track user balances",
      "Show who owes whom"
    ],
    evaluationHints: [
      {
        criterion: "Extensibility",
        description:
          "Consider whether new expense split strategies can be introduced."
      },
      {
        criterion: "Coupling & Cohesion",
        description:
          "Keep expense calculation separate from user and balance management."
      }
    ]
  })
];

export async function seedProblems(): Promise<void> {
  const repository = new MongoProblemRepository();

  for (const problem of problems) {
    await repository.save(problem);
  }

  console.log(`Seeded ${problems.length} problems.`);
}