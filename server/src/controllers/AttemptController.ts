import { Request, Response } from "express";
import {
  AttemptService,
  SaveSubmissionInput
} from "../services/AttemptService.js";

export class AttemptController {
  constructor(
    private readonly attemptService: AttemptService
  ) {}

  create = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { learnerId, problemId } = req.body;

      if (!learnerId || !problemId) {
        res.status(400).json({
          success: false,
          message: "learnerId and problemId are required."
        });
        return;
      }

      const attempt =
        await this.attemptService.createAttempt({
          learnerId,
          problemId
        });

      res.status(201).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error(error);

      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create attempt."
      });
    }
  };

  getById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      const attempt =
        await this.attemptService.getAttempt(id);

      res.status(200).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Attempt not found."
      });
    }
  };

  getByLearner = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const learnerId =
        req.params.learnerId as string;

      const attempts =
        await this.attemptService.getLearnerAttempts(
          learnerId
        );

      res.status(200).json({
        success: true,
        data: attempts
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch attempts."
      });
    }
  };

  saveSubmission = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const input: SaveSubmissionInput = req.body;

      const attempt =
        await this.attemptService.saveSubmission(
          id,
          input
        );

      res.status(200).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to save submission."
      });
    }
  };

  submit = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      const attempt =
        await this.attemptService.submitAttempt(id);

      res.status(200).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit attempt."
      });
    }
  };

  evaluate = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      const attempt =
        await this.attemptService.evaluateAttempt(id);

      res.status(200).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Evaluation failed."
      });
    }
  };

  getEvaluation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

      const evaluation =
        await this.attemptService.getEvaluation(id);

      res.status(200).json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Evaluation not found."
      });
    }
  };
}