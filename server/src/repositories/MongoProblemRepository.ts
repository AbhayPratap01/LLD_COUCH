import { Problem } from "../domain/Problem.js";
import { ProblemRepository } from "./ProblemRepository.js";
import { ProblemModel } from "../models/ProblemModel.js";

export class MongoProblemRepository implements ProblemRepository {
  async findAll(): Promise<Problem[]> {
    const documents = await ProblemModel.find().lean();

    return documents.map(
      (document) =>
        new Problem({
          id: document._id.toString(),
          title: document.title,
          slug: document.slug,
          difficulty: document.difficulty,
          description: document.description,
          requirements: document.requirements,
          evaluationHints: document.evaluationHints
        })
    );
  }

  async findById(id: string): Promise<Problem | null> {
    const document = await ProblemModel.findById(id).lean();

    if (!document) {
      return null;
    }

    return new Problem({
      id: document._id.toString(),
      title: document.title,
      slug: document.slug,
      difficulty: document.difficulty,
      description: document.description,
      requirements: document.requirements,
      evaluationHints: document.evaluationHints
    });
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const document = await ProblemModel.findOne({ slug }).lean();

    if (!document) {
      return null;
    }

    return new Problem({
      id: document._id.toString(),
      title: document.title,
      slug: document.slug,
      difficulty: document.difficulty,
      description: document.description,
      requirements: document.requirements,
      evaluationHints: document.evaluationHints
    });
  }

  async save(problem: Problem): Promise<Problem> {
    const document = await ProblemModel.findOneAndUpdate(
      { slug: problem.slug },
      {
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        description: problem.description,
        requirements: problem.requirements,
        evaluationHints: problem.evaluationHints
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    if (!document) {
      throw new Error("Failed to save problem.");
    }

    return new Problem({
      id: document._id.toString(),
      title: document.title,
      slug: document.slug,
      difficulty: document.difficulty,
      description: document.description,
      requirements: document.requirements,
      evaluationHints: document.evaluationHints
    });
  }
}