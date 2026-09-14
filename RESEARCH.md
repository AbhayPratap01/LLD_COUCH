# LLD Coach — Research Note

## 1. Problem Understanding

Low-Level Design (LLD) practice is different from simply solving coding problems. A learner needs to reason about:

- Domain objects and responsibilities
- Classes and interfaces
- Relationships between objects
- Encapsulation and separation of concerns
- Extensibility and future changes
- Trade-offs behind design decisions

Existing LLD practice resources generally provide problem statements and reference solutions, but the learner often has to evaluate their own design manually.

The main product opportunity is therefore not only to provide LLD problems, but to create a feedback loop:

> Choose Problem → Think/Design → Submit → Get Feedback → Review → Try Again

The feedback should help the learner understand *why* a design could be improved rather than simply declaring it correct or incorrect.

---

## 2. Existing Solutions and Observations

I reviewed several existing LLD practice approaches and platforms.

### LLD Problems / LLDcoding-style platforms

These platforms provide collections of LLD interview questions and commonly expected design approaches.

**Strengths**
- Large problem collections
- Useful for interview preparation
- Reference implementations and explanations

**Limitations**
- Feedback is usually based on comparison with an expected approach
- Less emphasis on evaluating the learner's reasoning
- Limited iterative practice workflow

### LLD Arena

LLD Arena demonstrates a more interactive approach with problems, coding, UML/design concepts and evaluation.

**Strengths**
- More structured practice
- Automated evaluation concepts
- Supports interview-oriented preparation

**Limitations**
- Evaluation can still become implementation/reference-solution oriented
- A learner may need more explanation about the reasoning behind design decisions

### LLDCanvas

LLDCanvas focuses on visual LLD/UML practice and provides a large set of problems.

**Strengths**
- Visual representation of designs
- Large problem collection
- Useful for practicing class relationships

**Limitations**
- Visual modelling can become the primary interaction
- A lightweight text-first workflow can be faster for learners who want to iterate quickly

---

## 3. Key Product Insight

The important opportunity is to treat LLD practice as an iterative learning process instead of a one-time answer submission.

A useful evaluator should answer:

1. Did the learner understand the requirements?
2. Did they identify appropriate domain objects?
3. Are responsibilities reasonably separated?
4. Are relationships between objects clearly explained?
5. Can the learner explain important design decisions?
6. What should they improve in their next attempt?

Importantly, LLD usually has multiple valid solutions.

Therefore, the evaluator should avoid:

> "Your classes do not match the expected solution."

Instead, it should provide evidence such as:

> "The design identifies the main domain objects, but the responsibility for payment processing and payment method selection is combined. Consider separating the changing payment behavior behind an abstraction."

This makes feedback more useful for learning.

---

## 4. Product Direction

Based on the research, I designed LLD Coach around a small feedback loop rather than trying to build a complete LLD IDE.

### Core learner journey

```text
Choose Problem
      ↓
Think / Design
      ↓
Submit
      ↓
Evaluate
      ↓
Get Feedback
      ↓
Review
      ↓
Try Again