import mongoose, { Schema, Document } from "mongoose";

export interface AttemptDocument extends Document {
  learnerId: string;
  problemId: string;

  status:
    | "draft"
    | "submitted"
    | "evaluating"
    | "completed"
    | "failed";

  submission?: {
    id: string;
    type: "text";
    content: {
      assumptions: string;
      classes: string;
      relationships: string;
      reasoning: string;
    };
    submittedAt?: Date;
  };

  evaluationId?: string;

  startedAt: Date;
  submittedAt?: Date;
}

const submissionSchema = new Schema(
  {
    id: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["text"],
      required: true
    },

    content: {
      assumptions: {
        type: String,
        required: true
      },

      classes: {
        type: String,
        required: true
      },

      relationships: {
        type: String,
        required: true
      },

      reasoning: {
        type: String,
        required: true
      }
    },

    submittedAt: Date
  },
  {
    _id: false
  }
);

const attemptSchema = new Schema<AttemptDocument>(
  {
    learnerId: {
      type: String,
      required: true,
      index: true
    },

    problemId: {
      type: String,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "evaluating",
        "completed",
        "failed"
      ],
      required: true,
      default: "draft"
    },

    submission: {
      type: submissionSchema
    },

    evaluationId: {
      type: String
    },

    startedAt: {
      type: Date,
      required: true
    },

    submittedAt: Date
  },
  {
    timestamps: true
  }
);

export const AttemptModel = mongoose.model<AttemptDocument>(
  "Attempt",
  attemptSchema
);