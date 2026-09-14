import { Submission } from "./Submission.js";
import { Evaluation } from "./Evaluation.js";

export type AttemptStatus =
  | "draft"
  | "submitted"
  | "evaluating"
  | "completed"
  | "failed";

export interface AttemptProps {
  id: string;
  learnerId: string;
  problemId: string;
  status?: AttemptStatus;
  submission?: Submission;
  evaluation?: Evaluation;
  startedAt?: Date;
  submittedAt?: Date;
}

export class Attempt {
  public readonly id: string;
  public readonly learnerId: string;
  public readonly problemId: string;

  private _status: AttemptStatus;
  private _submission?: Submission;
  private _evaluation?: Evaluation;

  public readonly startedAt: Date;
  private _submittedAt?: Date;

  constructor(props: AttemptProps) {
    this.id = props.id;
    this.learnerId = props.learnerId;
    this.problemId = props.problemId;

    this._status = props.status ?? "draft";
    this._submission = props.submission;
    this._evaluation = props.evaluation;

    this.startedAt = props.startedAt ?? new Date();
    this._submittedAt = props.submittedAt;
  }

  get status(): AttemptStatus {
    return this._status;
  }

  get submission(): Submission | undefined {
    return this._submission;
  }

  get evaluation(): Evaluation | undefined {
    return this._evaluation;
  }

  get submittedAt(): Date | undefined {
    return this._submittedAt;
  }

  attachSubmission(submission: Submission): void {
    if (this._status !== "draft") {
      throw new Error("Only draft attempts can be updated.");
    }

    this._submission = submission;
  }

  submit(): void {
    if (!this._submission) {
      throw new Error("Cannot submit an attempt without a submission.");
    }

    if (!this._submission.isComplete()) {
      throw new Error("Submission is incomplete.");
    }

    if (this._status !== "draft") {
      throw new Error("Attempt has already been submitted.");
    }

    this._status = "submitted";
    this._submittedAt = new Date();
  }

  startEvaluation(): void {
    if (this._status !== "submitted") {
      throw new Error("Only submitted attempts can be evaluated.");
    }

    this._status = "evaluating";
  }

  completeEvaluation(evaluation: Evaluation): void {
    if (this._status !== "evaluating") {
      throw new Error("Attempt is not currently being evaluated.");
    }

    this._evaluation = evaluation;
    this._status = "completed";
  }

  failEvaluation(): void {
    if (this._status !== "evaluating") {
      throw new Error("Attempt is not currently being evaluated.");
    }

    this._status = "failed";
  }
}