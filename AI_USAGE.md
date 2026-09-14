```md
# AI Usage

AI tools were used as an engineering assistant during the development of LLD Coach.

AI was used for architecture exploration, implementation support, test-case exploration, debugging, and review. Final engineering decisions were made based on the assignment requirements and verified through compilation, automated tests, and manual testing.

---

## 1. Architecture Exploration

AI was used to explore suitable architecture options for the assignment.

The final implementation uses a modular monolith with separate:

- Domain
- Services
- Repositories
- Evaluators
- Controllers
- Routes

A modular monolith was selected because the assignment emphasizes LLD/domain modelling and the MVP does not require distributed infrastructure.

This keeps the implementation focused while still providing clear boundaries between responsibilities.

---

## 2. Evaluator Abstraction

AI was used to explore how multiple evaluation strategies could coexist without coupling the application to one specific evaluator.

This resulted in the `Evaluator` abstraction:

```ts
interface Evaluator {
  evaluate(
    problem: Problem,
    submission: Submission,
    attemptId: string
  ): Promise<Evaluation>;
}