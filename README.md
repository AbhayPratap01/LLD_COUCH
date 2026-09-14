# LLD Coach

LLD Coach is a lightweight Low-Level Design practice platform that helps learners solve LLD problems, submit their designs, receive structured feedback, review previous attempts, and try again.

The core learner journey is:

> Choose Problem → Think / Design → Submit → Get Feedback → Review → Try Again

## Features

- LLD problem catalogue
- Attempt-based practice workflow
- Structured design submission
- Assumptions, classes, relationships, and design reasoning
- Deterministic rule-based evaluation
- AI evaluation abstraction
- Hybrid AI + rule-based fallback
- Rubric-based scoring
- Evidence-based feedback
- Actionable improvement suggestions
- Attempt history
- Review previous submissions
- Retry previous problems
- Backend unit tests

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript

### Database

- MongoDB
- Mongoose

### Architecture

- Modular monolith
- Domain-oriented design
- Service layer
- Repository pattern
- Strategy-based evaluator abstraction

---

## Architecture

```text
                    React Frontend
                          |
                          v
                    Express API
                          |
                          v
                     Controllers
                          |
                          v
                       Services
                          |
             +------------+------------+
             |                         |
             v                         v
        Repositories                Evaluator
             |                         |
             v                 +-------+-------+
          MongoDB              |       |       |
                               v       v       v
                           RuleBased   AI    Hybrid
                                      |        |
                                      v        |
                                  AIClient     |
                                      |        |
                                      v        |
                                  MockAIClient+