"use client";

import { useState } from "react";

type Props = {
  question: string;
  answer: string;
  explanation: string;
};

export default function TrueOrFalse({ question, answer, explanation }: Props) {
  const [guess, setGuess] = useState<boolean | null>(null);
  const correct = answer.trim().toLowerCase() === "true";
  const answered = guess !== null;
  const isCorrect = answered && guess === correct;

  const buttonClass = (value: boolean) => {
    const base =
      "rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:cursor-default";
    if (!answered) {
      return `${base} border border-zinc-300 text-zinc-700 hover:border-pink-500 hover:text-pink-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-pink-400 dark:hover:text-pink-400`;
    }
    if (value === correct) {
      return `${base} border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`;
    }
    if (value === guess) {
      return `${base} border border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400`;
    }
    return `${base} border border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500`;
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-pink-600 dark:text-pink-400">
        True or False
      </p>
      <p className="mb-4 font-medium text-zinc-900 dark:text-zinc-50">{question}</p>
      <div className="flex flex-wrap gap-2">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            disabled={answered}
            onClick={() => setGuess(value)}
            className={buttonClass(value)}
          >
            {value ? "True" : "False"}
          </button>
        ))}
      </div>
      {answered && (
        <p className="mt-4 text-sm">
          <span
            className={isCorrect ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-semibold text-rose-600 dark:text-rose-400"}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </span>
          {explanation && (
            <span className="mt-1 block text-zinc-600 dark:text-zinc-400">
              {explanation}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
