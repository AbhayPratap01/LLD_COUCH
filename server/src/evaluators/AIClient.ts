export interface AIClient {
  generateEvaluation(prompt: string): Promise<string>;
}