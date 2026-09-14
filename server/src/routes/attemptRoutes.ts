import { Router } from "express";
import { AttemptController } from "../controllers/AttemptController.js";

export function createAttemptRoutes(
  controller: AttemptController
): Router {
  const router = Router();

  router.post("/", controller.create);

  router.get(
    "/learner/:learnerId",
    controller.getByLearner
  );

  router.get("/:id", controller.getById);

  router.put(
    "/:id/submission",
    controller.saveSubmission
  );

  router.post(
    "/:id/submit",
    controller.submit
  );

  router.post(
    "/:id/evaluate",
    controller.evaluate
  );

  router.get(
    "/:id/evaluation",
    controller.getEvaluation
  );

  return router;
}