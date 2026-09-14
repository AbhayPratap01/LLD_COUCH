export interface EvaluationCriterion {
  name: string;
  score: number;
  maxScore: number;
  evidence: string;
  concern: string;
  suggestion: string;
}

export interface EvaluationProps {
  id: string;
  attemptId: string;
  overallScore: number;
  criteria: EvaluationCriterion[];
  strengths: string[];
  improvements: string[];
  summary: string;
  confidence: number;
  evaluatedAt: Date;
}

export class Evaluation {
  public readonly id: string;
  public readonly attemptId: string;
  public readonly overallScore: number;
  public readonly criteria: EvaluationCriterion[];
  public readonly strengths: string[];
  public readonly improvements: string[];
  public readonly summary: string;
  public readonly confidence: number;
  public readonly evaluatedAt: Date;

  constructor(props: EvaluationProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.overallScore = props.overallScore;
    this.criteria = props.criteria;
    this.strengths = props.strengths;
    this.improvements = props.improvements;
    this.summary = props.summary;
    this.confidence = props.confidence;
    this.evaluatedAt = props.evaluatedAt;
  }
}