import mongoose, { Schema, Document } from "mongoose";

export interface EvaluationDocument extends Document {
  attemptId: string;
  overallScore: number;

  criteria: {
    name: string;
    score: number;
    maxScore: number;
    evidence: string;
    concern: string;
    suggestion: string;
  }[];

  strengths: string[];
  improvements: string[];
  summary: string;
  confidence: number;
  evaluatedAt: Date;
}

const criterionSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    score: {
      type: Number,
      required: true
    },

    maxScore: {
      type: Number,
      required: true
    },

    evidence: {
      type: String,
      required: true
    },

    concern: {
      type: String,
      required: true
    },

    suggestion: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
);

const evaluationSchema = new Schema<EvaluationDocument>(
  {
    attemptId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    criteria: {
      type: [criterionSchema],
      required: true
    },

    strengths: {
      type: [String],
      default: []
    },

    improvements: {
      type: [String],
      default: []
    },

    summary: {
      type: String,
      required: true
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },

    evaluatedAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const EvaluationModel =
  mongoose.model<EvaluationDocument>(
    "Evaluation",
    evaluationSchema
  );