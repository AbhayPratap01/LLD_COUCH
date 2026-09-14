import { Types } from "mongoose";
import { Attempt } from "../domain/Attempt.js";
import { Submission } from "../domain/Submission.js";
import { AttemptRepository } from "../repositories/AttemptRepository.js";
import { EvaluationRepository } from "../repositories/EvaluationRepository.js";
import { ProblemRepository } from "../repositories/ProblemRepository.js";
import { Evaluator } from "../evaluators/Evaluator.js";

export interface CreateAttemptInput {
  learnerId: string;
  problemId: string;
}

export interface SaveSubmissionInput {
  assumptions: string;
  classes: string;
  relationships: string;
  reasoning: string;
}

export class AttemptService {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly problemRepository: ProblemRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly evaluator: Evaluator
  ) {}

  async createAttempt(
    input: CreateAttemptInput
  ): Promise<Attempt> {
    const problem = await this.problemRepository.findById(
      input.problemId
    );

    if (!problem) {
      throw new Error("Problem not found.");
    }

    const attempt = new Attempt({
      id: new Types.ObjectId().toString(),
      learnerId: input.learnerId,
      problemId: input.problemId
    });

    return this.attemptRepository.save(attempt);
  }

  async getAttempt(id: string): Promise<Attempt> {
    const attempt = await this.attemptRepository.findById(id);

    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    return attempt;
  }

  async getLearnerAttempts(
    learnerId: string
  ): Promise<Attempt[]> {
    return this.attemptRepository.findByLearnerId(learnerId);
  }

  async saveSubmission(
    id: string,
    input: SaveSubmissionInput
  ): Promise<Attempt> {
    const attempt = await this.getAttempt(id);

    const submission = new Submission({
      id: new Types.ObjectId().toString(),
      type: "text",
      content: input
    });

    attempt.attachSubmission(submission);

    return this.attemptRepository.save(attempt);
  }

  async submitAttempt(id: string): Promise<Attempt> {
    const attempt = await this.getAttempt(id);

    attempt.submit();

    await this.attemptRepository.save(attempt);

    return attempt;
  }

  async evaluateAttempt(id: string): Promise<Attempt> {
    const attempt = await this.getAttempt(id);

    if (!attempt.submission) {
      throw new Error("Attempt has no submission.");
    }

    attempt.startEvaluation();

    await this.attemptRepository.save(attempt);

    try {
      const problem = await this.problemRepository.findById(
        attempt.problemId
      );

      if (!problem) {
        throw new Error("Problem not found.");
      }

      const evaluation = await this.evaluator.evaluate(
        problem,
        attempt.submission,
        attempt.id
      );

      await this.evaluationRepository.save(evaluation);

      attempt.completeEvaluation(evaluation);

      return this.attemptRepository.save(attempt);
    } catch (error) {
      attempt.failEvaluation();

      await this.attemptRepository.save(attempt);

      throw error;
    }
  }

  async getEvaluation(id: string) {
    const evaluation =
      await this.evaluationRepository.findByAttemptId(id);

    if (!evaluation) {
      throw new Error("Evaluation not found.");
    }

    return evaluation;
  }
}