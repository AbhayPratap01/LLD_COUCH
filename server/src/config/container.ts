import { MongoProblemRepository } from "../repositories/MongoProblemRepository.js";
import { MongoAttemptRepository } from "../repositories/MongoAttemptRepository.js";
import { MongoEvaluationRepository } from "../repositories/MongoEvaluationRepository.js";

import { RuleBasedEvaluator } from "../evaluators/RuleBasedEvaluator.js";
import { AIEvaluator } from "../evaluators/AIEvaluator.js";
import { HybridEvaluator } from "../evaluators/HybridEvaluator.js";
import { MockAIClient } from "../evaluators/MockAIClient.js";

import { AttemptService } from "../services/AttemptService.js";

import { ProblemController } from "../controllers/ProblemController.js";
import { AttemptController } from "../controllers/AttemptController.js";

export function createContainer() {
  const problemRepository =
    new MongoProblemRepository();

  const attemptRepository =
    new MongoAttemptRepository();

  const evaluationRepository =
    new MongoEvaluationRepository();

  const ruleBasedEvaluator =
    new RuleBasedEvaluator();

  const aiClient =
    new MockAIClient();

  const aiEvaluator =
    new AIEvaluator(aiClient);

  const evaluator =
    new HybridEvaluator(
      ruleBasedEvaluator,
      aiEvaluator
    );

  const attemptService =
    new AttemptService(
      attemptRepository,
      problemRepository,
      evaluationRepository,
      evaluator
    );

  const problemController =
    new ProblemController(problemRepository);

  const attemptController =
    new AttemptController(attemptService);

  return {
    problemController,
    attemptController,
  };
}