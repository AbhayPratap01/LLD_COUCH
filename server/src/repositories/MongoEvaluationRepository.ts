import {
  Evaluation,
  EvaluationCriterion
} from "../domain/Evaluation.js";

import { EvaluationRepository } from "./EvaluationRepository.js";

import { EvaluationModel } from "../models/EvaluationModel.js";

export class MongoEvaluationRepository
  implements EvaluationRepository
{
  async findByAttemptId(
    attemptId: string
  ): Promise<Evaluation | null> {
    const document = await EvaluationModel.findOne({
      attemptId
    }).lean();

    if (!document) {
      return null;
    }

    return this.toDomain(document);
  }

  async save(
    evaluation: Evaluation
  ): Promise<Evaluation> {
    const document =
      await EvaluationModel.findOneAndUpdate(
        {
          attemptId: evaluation.attemptId
        },
        {
          attemptId: evaluation.attemptId,
          overallScore: evaluation.overallScore,
          criteria: evaluation.criteria,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          summary: evaluation.summary,
          confidence: evaluation.confidence,
          evaluatedAt: evaluation.evaluatedAt
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      ).lean();

    if (!document) {
      throw new Error("Failed to save evaluation.");
    }

    return this.toDomain(document);
  }

  private toDomain(document: any): Evaluation {
    const criteria: EvaluationCriterion[] =
      document.criteria.map(
        (criterion: any) => ({
          name: criterion.name,
          score: criterion.score,
          maxScore: criterion.maxScore,
          evidence: criterion.evidence,
          concern: criterion.concern,
          suggestion: criterion.suggestion
        })
      );

    return new Evaluation({
      id: document._id.toString(),
      attemptId: document.attemptId,
      overallScore: document.overallScore,
      criteria,
      strengths: document.strengths,
      improvements: document.improvements,
      summary: document.summary,
      confidence: document.confidence,
      evaluatedAt: document.evaluatedAt
    });
  }
}