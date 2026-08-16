"use client";

import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Props = {
  questions: Question[];
};

function letterFor(index: number): string {
  return String.fromCharCode(65 + index);
}

function cleanOption(option: string): string {
  return option.replace(/^[A-Za-z][.:]\s*/, "");
}

function isCorrect(question: Question, index: number): boolean {
  if (index == null) return false;
  const answer = question.answer.trim().toLowerCase();
  const option = question.options[index]?.trim().toLowerCase() ?? "";
  const letter = letterFor(index).toLowerCase();
  return option === answer || letter === answer.replace(/[^a-z]/g, "");
}

export default function Quiz({ questions }: Props) {
  const [picks, setPicks] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState(false);

  const answered = questions.every((_, i) => picks[i] != null);
  const score = questions.filter((q, i) => revealed && isCorrect(q, picks[i] ?? -1)).length;
  const allCorrect = revealed && score === questions.length;

  const optionClass = (questionIndex: number, optionIndex: number) => {
    const base =
      "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors";
    if (!revealed) {
      const selected = picks[questionIndex] === optionIndex;
      return selected
        ? `${base} border-pink-500 bg-pink-500/10 font-medium text-zinc-900 dark:text-zinc-50`
        : `${base} border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700`;
    }
    const question = questions[questionIndex];
    if (isCorrect(question, optionIndex)) {
      return `${base} border-emerald-500 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400`;
    }
    if (picks[questionIndex] === optionIndex) {
      return `${base} border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400`;
    }
    return `${base} border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500`;
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-pink-600 dark:text-pink-400">
        Mini Quiz
      </p>
      <div className="space-y-6">
        {questions.map((question, qi) => (
          <div key={qi}>
            <p className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
              {questions.length > 1 && <span className="text-zinc-500 dark:text-zinc-400">{qi + 1}. </span>}
              {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((option, oi) => (
                <button
                  key={oi}
                  type="button"
                  disabled={revealed}
                  onClick={() => setPicks((prev) => ({ ...prev, [qi]: oi }))}
                  className={optionClass(qi, oi)}
                >
                  <span className="mt-px inline-block w-5 shrink-0 font-mono text-xs text-zinc-400">
                    {letterFor(oi)}.
                  </span>
                  <span>{cleanOption(option)}</span>
                </button>
              ))}
            </div>
            {revealed && question.explanation && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {isCorrect(question, picks[qi] ?? -1) ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Correct. </span>
                ) : (
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Not quite. </span>
                )}
                {question.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={!answered}
          className="mt-6 rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
        >
          Check answers
        </button>
      ) : (
        <p className="mt-6 text-sm font-semibold">
          <span className={allCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-50"}>
            You scored {score} of {questions.length}.
          </span>{" "}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">
            {allCorrect
              ? "Nailed it."
              : score >= questions.length / 2
                ? "Nice work — reread the sections you missed."
                : "Worth a re-read, then try again."}
          </span>
        </p>
      )}
    </div>
  );
}
