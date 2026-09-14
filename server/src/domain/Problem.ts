export type Difficulty = "easy" | "medium" | "hard";

export interface EvaluationHint {
  criterion: string;
  description: string;
}

export interface ProblemProps {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  evaluationHints: EvaluationHint[];
}

export class Problem {
  public readonly id: string;
  public readonly title: string;
  public readonly slug: string;
  public readonly difficulty: Difficulty;
  public readonly description: string;
  public readonly requirements: string[];
  public readonly evaluationHints: EvaluationHint[];

  constructor(props: ProblemProps) {
    this.id = props.id;
    this.title = props.title;
    this.slug = props.slug;
    this.difficulty = props.difficulty;
    this.description = props.description;
    this.requirements = props.requirements;
    this.evaluationHints = props.evaluationHints;
  }
}