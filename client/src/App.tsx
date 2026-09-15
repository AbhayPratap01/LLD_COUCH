import { useEffect, useState } from "react";

type EvaluationCriterion = {
  name: string;
  score: number;
  maxScore: number;
  evidence: string;
  concern: string;
  suggestion: string;
};

type Evaluation = {
  id: string;
  attemptId: string;
  overallScore: number;
  criteria: EvaluationCriterion[];
  strengths: string[];
  improvements: string[];
  summary: string;
  confidence: number;
};

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  requirements: string[];
};

type Attempt = {
  id: string;
  learnerId: string;
  problemId: string;
  status?: string;
  _submission?: {
    id: string;
    type: string;
    content?: Partial<Submission>;
  };
};

type AttemptHistoryItem = {
  attempt: Attempt;
  problem: Problem;
  evaluation: Evaluation | null;
};

type Submission = {
  assumptions: string;
  classes: string;
  relationships: string;
  reasoning: string;
};

const API_URL = "http://localhost:5000/api";
const LEARNER_ID = "demo-learner";

function getAttemptStatusLabel(
  attempt: Attempt,
  hasEvaluation: boolean
): string {
  if (hasEvaluation) {
    return "Completed";
  }

  switch ((attempt.status ?? "").toLowerCase()) {
    case "draft":
      return "Draft";

    case "submitted":
      return "Submitted";

    case "evaluating":
      return "Evaluating";

    case "completed":
      return "Completed";

    case "evaluation_failed":
      return "Evaluation Failed";

    default:
      return "In Progress";
  }
}

function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] =
    useState<Problem | null>(null);

  const [attempt, setAttempt] = useState<Attempt | null>(null);

  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [review, setReview] = useState<{
    problem: Problem;
    evaluation: Evaluation;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  initializeApp();
}, []);
  const initializeApp = async () => {
    const fetchedProblems = await fetchProblems();

    await fetchAttemptHistory(fetchedProblems);

    const savedAttemptId = localStorage.getItem(
      "lld-coach-attempt-id"
    );

  if (!savedAttemptId) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/attempts/${savedAttemptId}`
    );

    if (!response.ok) {
      localStorage.removeItem("lld-coach-attempt-id");
      return;
    }

    const result = await response.json();
    const restoredAttempt: Attempt = result.data;

    const problemResponse = await fetch(
      `${API_URL}/problems/${restoredAttempt.problemId}`
    );

    if (!problemResponse.ok) {
      return;
    }

    const problemResult = await problemResponse.json();

    setAttempt(restoredAttempt);
    setSelectedProblem(problemResult.data);
  } catch (err) {
    console.error("Failed to restore attempt:", err);
  }
};

  const fetchProblems = async (): Promise<Problem[]> => {
    try {
      const response = await fetch(`${API_URL}/problems`);

      if (!response.ok) {
        throw new Error("Failed to fetch problems.");
      }

      const result = await response.json();

      setProblems(result.data);
      return result.data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptHistory = async (
    fetchedProblems: Problem[]
  ) => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/attempts/learner/${LEARNER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attempt history.");
      }

      const result = await response.json();
      const attempts: Attempt[] = result.data;

      const historyItems = await Promise.all(
        attempts.map(async (attempt) => {
          const problem = fetchedProblems.find(
            (item) => item.id === attempt.problemId
          );

          if (!problem) {
            return null;
          }

          let evaluation: Evaluation | null = null;

          // Try to load an evaluation for every historical attempt.
          // This keeps the UI independent of the exact backend status
          // string and lets completed evaluations appear in history.
          try {
            const evaluationResponse = await fetch(
              `${API_URL}/attempts/${attempt.id}/evaluation`
            );

            if (evaluationResponse.ok) {
              const evaluationResult =
                await evaluationResponse.json();

              evaluation = evaluationResult.data;
            }
          } catch (error) {
            console.error(
              `Failed to load evaluation for ${attempt.id}:`,
              error
            );
          }

          return {
            attempt,
            problem,
            evaluation,
          };
        })
      );

      setHistory(
        historyItems.filter(
          (item): item is AttemptHistoryItem => item !== null
        )
      );
    } catch (error) {
      console.error("Failed to fetch attempt history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startPractice = async (problem: Problem) => {
    try {
      setStarting(true);
      setError("");

      const response = await fetch(`${API_URL}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learnerId: LEARNER_ID,
          problemId: problem.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to start practice."
        );
      }

      setSelectedProblem(problem);
setAttempt(result.data);

localStorage.setItem(
  "lld-coach-attempt-id",
  result.data.id
);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start practice."
      );
    } finally {
      setStarting(false);
    }
  };

  const backToProblems = () => {
  localStorage.removeItem("lld-coach-attempt-id");

  setSelectedProblem(null);
  setAttempt(null);
  setError("");
};

  if (review) {
    return (
      <FeedbackView
        problem={review.problem}
        evaluation={review.evaluation}
        onBack={() => setReview(null)}
      />
    );
  }

  if (selectedProblem && attempt) {
    return (
      <PracticeWorkspace
        problem={selectedProblem}
        attempt={attempt}
        onBack={backToProblems}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              LLD Coach
            </h1>

            <p className="text-xs text-slate-400">
              Practice. Design. Improve.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Demo Learner
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-300">
            Low-Level Design Practice
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sharpen your LLD skills
            <span className="block text-indigo-400">
              through deliberate practice.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Choose a design problem, explain your solution, and
            receive structured feedback on responsibilities,
            abstractions, extensibility, and design quality.
          </p>
        </div>
      </section>

      {history.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold">
              Recent attempts
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Review previous designs and track your progress.
            </p>
          </div>

          {historyLoading ? (
            <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map(
  ({ attempt, problem, evaluation }) => {
    const statusLabel = getAttemptStatusLabel(
      attempt,
      Boolean(evaluation)
    );

    return (
      <div
        key={attempt.id}
        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/4 p-5"
      >
        <div>
          <h4 className="font-semibold">
            {problem.title}
          </h4>

          <p className="mt-1 text-sm text-slate-500">
            {evaluation
              ? "Evaluation complete"
              : statusLabel === "Draft"
                ? "Draft — not submitted"
                : `Status: ${statusLabel}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {evaluation && (
            <div className="text-right">
              <p className="text-lg font-bold">
                {evaluation.overallScore}
                <span className="text-xs font-normal text-slate-500">
                  /100
                </span>
              </p>
            </div>
          )}

          {evaluation ? (
            <button
              onClick={() =>
                setReview({
                  problem,
                  evaluation,
                })
              }
              className="rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-400/20"
            >
              Review
            </button>
          ) : statusLabel === "Draft" ? (
            <button
              onClick={async () => {
                try {
                  setError("");
                  setStarting(true);

                  const response = await fetch(
                    `${API_URL}/attempts/${attempt.id}`
                  );

                  if (!response.ok) {
                    throw new Error(
                      "Failed to resume attempt."
                    );
                  }

                  const result =
                    await response.json();

                  setAttempt(result.data);
                  setSelectedProblem(problem);

                  localStorage.setItem(
                    "lld-coach-attempt-id",
                    attempt.id
                  );
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to resume attempt."
                  );
                } finally {
                  setStarting(false);
                }
              }}
              disabled={starting}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-500">
              {statusLabel}
            </span>
          )}
        </div>
      </div>
    );
  }
)}
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-semibold">
              Choose a problem
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Pick a problem and start designing.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {problems.length} problems
          </span>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-red-300">
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-300/70">
              {error}
            </p>
          </div>
        )}

        {!loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                starting={starting}
                onStart={startPractice}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

type ProblemCardProps = {
  problem: Problem;
  starting: boolean;
  onStart: (problem: Problem) => void;
};

function ProblemCard({
  problem,
  starting,
  onStart,
}: ProblemCardProps) {
  const difficultyStyles = {
    easy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    medium:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    hard: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <article className="group rounded-2xl border border-white/10 bg-white/4 p-6 transition hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-xl font-semibold">
            {problem.title}
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {problem.description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize ${
            difficultyStyles[problem.difficulty]
          }`}
        >
          {problem.difficulty}
        </span>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          What you'll design
        </p>

        <div className="flex flex-wrap gap-2">
          {problem.requirements
            .slice(0, 4)
            .map((requirement) => (
              <span
                key={requirement}
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300"
              >
                {requirement}
              </span>
            ))}
        </div>
      </div>

      <button
        onClick={() => onStart(problem)}
        disabled={starting}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {starting ? "Starting..." : "Start Practice"}

        {!starting && (
          <span className="transition group-hover:translate-x-1">
            →
          </span>
        )}
      </button>
    </article>
  );
}

type PracticeWorkspaceProps = {
  problem: Problem;
  attempt: Attempt;
  onBack: () => void;
};

function PracticeWorkspace({
  problem,
  attempt,
  onBack,
}: PracticeWorkspaceProps) {
  const [submission, setSubmission] = useState<Submission>({
    assumptions:
      attempt._submission?.content?.assumptions ?? "",

    classes:
      attempt._submission?.content?.classes ?? "",

    relationships:
      attempt._submission?.content?.relationships ?? "",

    reasoning:
      attempt._submission?.content?.reasoning ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const updateField = (
    field: keyof Submission,
    value: string
  ) => {
    setSubmission((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const saveSubmission = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch(
        `${API_URL}/attempts/${attempt.id}/submission`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submission),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save submission."
        );
      }

      setSaved(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save submission."
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitForEvaluation = async () => {
    const fields = Object.values(submission);

    const hasEmptyField = fields.some(
      (value) => !value.trim()
    );

    if (hasEmptyField) {
      setError(
        "Complete all four sections before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setEvaluation(null);

      // Always save the latest version first.
      const savedSuccessfully = await saveSubmission();

      if (!savedSuccessfully) {
        return;
      }

      // Move attempt from draft → submitted.
      const submitResponse = await fetch(
        `${API_URL}/attempts/${attempt.id}/submit`,
        {
          method: "POST",
        }
      );

      const submitResult = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(
          submitResult.message || "Failed to submit attempt."
        );
      }

      // Run evaluation.
      const evaluateResponse = await fetch(
        `${API_URL}/attempts/${attempt.id}/evaluate`,
        {
          method: "POST",
        }
      );

      const evaluateResult =
        await evaluateResponse.json();

      if (!evaluateResponse.ok) {
        throw new Error(
          evaluateResult.message ||
            "Evaluation failed."
        );
      }

      // Fetch the persisted evaluation.
      const evaluationResponse = await fetch(
        `${API_URL}/attempts/${attempt.id}/evaluation`
      );

      const evaluationResult =
        await evaluationResponse.json();

      if (!evaluationResponse.ok) {
        throw new Error(
          evaluationResult.message ||
            "Failed to load evaluation."
        );
      }

      setEvaluation(evaluationResult.data);

      localStorage.removeItem(
        "lld-coach-attempt-id"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during evaluation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (evaluation) {
    return (
      <FeedbackView
        problem={problem}
        evaluation={evaluation}
        onBack={onBack}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to problems
          </button>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs capitalize text-amber-300">
              {problem.difficulty}
            </span>

            <span className="text-xs text-slate-500">
              {submitting
                ? "Evaluating..."
                : "Draft attempt"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Problem */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/4 p-6 lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Problem
            </p>

            <h1 className="mt-3 text-2xl font-bold">
              {problem.title}
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              {problem.description}
            </p>

            <div className="mt-8">
              <h2 className="text-sm font-semibold">
                Requirements
              </h2>

              <ul className="mt-4 space-y-3">
                {problem.requirements.map(
                  (requirement) => (
                    <li
                      key={requirement}
                      className="flex gap-3 text-sm leading-5 text-slate-400"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {requirement}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="mt-8 rounded-xl border border-indigo-400/10 bg-indigo-400/5 p-4">
              <p className="text-xs font-semibold text-indigo-300">
                Design tip
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Focus on responsibilities, relationships,
                interfaces, and how your design could evolve
                when requirements change.
              </p>
            </div>
          </aside>

          {/* Editor */}
          <section>
            <div className="mb-8">
              <p className="text-sm text-slate-500">
                Attempt #{attempt.id.slice(-6)}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Design your solution
              </h2>

              <p className="mt-2 text-slate-400">
                Explain your design clearly. There can be
                multiple valid solutions.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <DesignField
                label="Assumptions"
                hint="What assumptions are you making about the problem?"
                value={submission.assumptions}
                onChange={(value) =>
                  updateField("assumptions", value)
                }
                placeholder="Example: A vehicle occupies one parking spot at a time..."
              />

              <DesignField
                label="Classes & Interfaces"
                hint="Identify important classes, interfaces, and their responsibilities."
                value={submission.classes}
                onChange={(value) =>
                  updateField("classes", value)
                }
                placeholder="Example: ParkingLot, ParkingFloor, ParkingSpot..."
              />

              <DesignField
                label="Relationships"
                hint="Explain how your classes interact with each other."
                value={submission.relationships}
                onChange={(value) =>
                  updateField("relationships", value)
                }
                placeholder="Example: ParkingLot contains multiple ParkingFloors..."
              />

              <DesignField
                label="Design Reasoning"
                hint="Explain important decisions and trade-offs."
                value={submission.reasoning}
                onChange={(value) =>
                  updateField("reasoning", value)
                }
                placeholder="Explain why responsibilities are assigned this way..."
                rows={7}
              />
            </div>

            {/* Actions */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {saved ? (
                    <p className="text-sm text-emerald-400">
                      ✓ Draft saved
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Save your work before submitting.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveSubmission}
                    disabled={saving || submitting}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Draft"}
                  </button>

                  <button
                    onClick={submitForEvaluation}
                    disabled={saving || submitting}
                    className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Evaluating..."
                      : "Submit for Evaluation →"}
                  </button>
                </div>
              </div>

              {submitting && (
                <div className="mt-5 rounded-xl border border-indigo-400/10 bg-indigo-400/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" />

                    <div>
                      <p className="text-sm font-medium text-indigo-200">
                        Evaluating your design
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Checking completeness, responsibilities,
                        extensibility, and design reasoning.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type DesignFieldProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
};

function FeedbackView({
  problem,
  evaluation,
  onBack,
}: {
  problem: Problem;
  evaluation: Evaluation;
  onBack: () => void;
}) {
  const score = evaluation.overallScore;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Practice another problem
          </button>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Evaluation complete
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/4 p-8">
          <p className="text-sm text-indigo-400">
            {problem.title}
          </p>

          <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                Your design review
              </h1>

              <p className="mt-3 max-w-xl text-slate-400">
                Review the evidence behind your score and
                identify what to improve in your next attempt.
              </p>
            </div>

            <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-400/10">
              <span className="text-4xl font-bold text-indigo-300">
                {score}
              </span>

              <span className="text-xs text-slate-500">
                / 100
              </span>
            </div>
          </div>

          {evaluation.summary && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm font-semibold">
                Overall assessment
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                {evaluation.summary}
              </p>
            </div>
          )}
        </section>

        {/* Criteria */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Evaluation breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Feedback is based on evidence from your submission.
            </p>
          </div>

          <div className="space-y-4">
            {evaluation.criteria.map((criterion) => {
              const percentage =
                criterion.maxScore > 0
                  ? (criterion.score /
                      criterion.maxScore) *
                    100
                  : 0;

              return (
                <article
                  key={criterion.name}
                  className="rounded-2xl border border-white/10 bg-white/4 p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {criterion.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Evidence-based assessment
                      </p>
                    </div>

                    <div className="rounded-lg bg-white/5 px-3 py-1.5 text-sm font-semibold">
                      {criterion.score} /{" "}
                      {criterion.maxScore}
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  {criterion.evidence && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Evidence
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {criterion.evidence}
                      </p>
                    </div>
                  )}

                  {criterion.concern && (
                    <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Concern
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {criterion.concern}
                      </p>
                    </div>
                  )}

                  {criterion.suggestion && (
                    <div className="mt-4 rounded-xl border border-indigo-400/10 bg-indigo-400/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        Suggestion
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {criterion.suggestion}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Strengths / Improvements */}
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <FeedbackList
            title="What you did well"
            items={evaluation.strengths}
            emptyText="No specific strengths were recorded."
          />

          <FeedbackList
            title="What to improve"
            items={evaluation.improvements}
            emptyText="No specific improvements were recorded."
          />
        </section>

        {/* Retry */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onBack}
            className="rounded-xl bg-indigo-500 px-7 py-3 text-sm font-semibold transition hover:bg-indigo-400"
          >
            Try another problem →
          </button>
        </div>
      </div>
    </main>
  );
}

function FeedbackList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/4 p-6">
      <h3 className="font-semibold">{title}</h3>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-400"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </article>
  );
}

function DesignField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 5,
}: DesignFieldProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
      <div className="mb-3">
        <label className="text-sm font-semibold">
          {label}
        </label>

        <p className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-700 transition focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30"
      />
    </div>
  );
}

export default App;