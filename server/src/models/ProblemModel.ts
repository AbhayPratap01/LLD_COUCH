import mongoose, { Schema, Document } from "mongoose";

export interface ProblemDocument extends Document {
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  requirements: string[];
  evaluationHints: {
    criterion: string;
    description: string;
  }[];
}

const evaluationHintSchema = new Schema(
  {
    criterion: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const problemSchema = new Schema<ProblemDocument>(
  {
    title: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },

    description: {
      type: String,
      required: true
    },

    requirements: {
      type: [String],
      required: true
    },

    evaluationHints: {
      type: [evaluationHintSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const ProblemModel = mongoose.model<ProblemDocument>(
  "Problem",
  problemSchema
);