import { Attempt } from "../domain/Attempt.js";
import { Submission } from "../domain/Submission.js";
import { AttemptRepository } from "./AttemptRepository.js";
import { AttemptModel } from "../models/AttemptModel.js";

export class MongoAttemptRepository implements AttemptRepository {
  async findById(id: string): Promise<Attempt | null> {
    const document = await AttemptModel.findById(id).lean();

    if (!document) {
      return null;
    }

    return this.toDomain(document);
  }

  async findByLearnerId(learnerId: string): Promise<Attempt[]> {
    const documents = await AttemptModel.find({
      learnerId
    })
      .sort({ startedAt: -1 })
      .lean();

    return documents.map((document) => this.toDomain(document));
  }

  async save(attempt: Attempt): Promise<Attempt> {
    const document = await AttemptModel.findByIdAndUpdate(
      attempt.id,
      {
        learnerId: attempt.learnerId,
        problemId: attempt.problemId,
        status: attempt.status,
        submission: attempt.submission,
        evaluationId: attempt.evaluation?.id,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    if (!document) {
      throw new Error("Failed to save attempt.");
    }

    return this.toDomain(document);
  }

  private toDomain(document: any): Attempt {
    const submission = document.submission
      ? new Submission({
          id: document.submission.id,
          type: document.submission.type,
          content: document.submission.content,
          submittedAt: document.submission.submittedAt
        })
      : undefined;

    return new Attempt({
      id: document._id.toString(),
      learnerId: document.learnerId,
      problemId: document.problemId,
      status: document.status,
      submission,
      startedAt: document.startedAt,
      submittedAt: document.submittedAt
    });
  }
}