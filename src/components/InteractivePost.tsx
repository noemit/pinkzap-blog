"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import Quiz from "./Quiz";
import TrueOrFalse from "./TrueOrFalse";

type Payload =
  | {
      type: "trufalse";
      question: string;
      answer: string;
      explanation: string;
    }
  | {
      type: "quiz";
      questions: {
        question: string;
        options: string[];
        answer: string;
        explanation: string;
      }[];
    };

export default function InteractivePost({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const roots: Array<{ unmount: () => void }> = [];

    container.querySelectorAll<HTMLElement>("[data-widget]").forEach((element) => {
      try {
        const payload = JSON.parse(element.dataset.payload ?? "{}") as Payload;
        const root = createRoot(element);
        roots.push(root);
        if (payload.type === "quiz") {
          root.render(<Quiz questions={payload.questions} />);
        } else {
          root.render(
            <TrueOrFalse
              question={payload.question}
              answer={payload.answer}
              explanation={payload.explanation}
            />,
          );
        }
      } catch {
        // Leave the static fallback content in place.
      }
    });

    return () => roots.forEach((root) => root.unmount());
  }, []);

  return (
    <div
      ref={containerRef}
      className="prose prose-zinc max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
