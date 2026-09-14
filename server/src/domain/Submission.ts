export type SubmissionType = "text";

export interface TextSubmissionContent {
  assumptions: string;
  classes: string;
  relationships: string;
  reasoning: string;
}

export interface SubmissionProps {
  id: string;
  type: SubmissionType;
  content: TextSubmissionContent;
  submittedAt?: Date;
}

export class Submission {
  public readonly id: string;
  public readonly type: SubmissionType;
  public readonly content: TextSubmissionContent;
  public readonly submittedAt?: Date;

  constructor(props: SubmissionProps) {
    this.id = props.id;
    this.type = props.type;
    this.content = props.content;
    this.submittedAt = props.submittedAt;
  }

  isComplete(): boolean {
    const { assumptions, classes, relationships, reasoning } = this.content;

    return [assumptions, classes, relationships, reasoning]
      .every((field) => field.trim().length > 0);
  }
}