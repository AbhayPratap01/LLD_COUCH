import { Request, Response } from "express";
import { ProblemRepository } from "../repositories/ProblemRepository.js";

export class ProblemController {
  constructor(
    private readonly problemRepository: ProblemRepository
  ) {}

  getAll = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const problems = await this.problemRepository.findAll();

      res.status(200).json({
        success: true,
        data: problems
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch problems."
      });
    }
  };

  getById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const problem = await this.problemRepository.findById(id);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found."
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch problem."
    });
  }
};
}