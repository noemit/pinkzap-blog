import type { Plugin, Transformer } from "unified";
import type { Root, Content, Html } from "mdast";

type DirectiveNode = {
  type: "containerDirective";
  name: string;
  children: Content[];
};

type ParsedQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Widget = {
  type: "quiz" | "trufalse";
  questions: ParsedQuestion[];
};

const QUESTION_RE = /^\s*question\b\s*\d*\s*[:.]\s*(.+)$/i;
const STATEMENT_RE = /^\s*statement\s*[:.]\s*(.+)$/i;
const ANSWER_RE = /^\s*answer\s*[:.]\s*(.+)$/i;
const EXPLANATION_RE = /^\s*explanation\s*[:.]\s*(.+)$/i;

function textOf(node: Content | undefined): string {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") {
    return String((node as { value?: string }).value ?? "");
  }
  const children = (node as { children?: Content[] }).children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeTrueFalse(value: string): string {
  return /^\s*t/i.test(value) ? "True" : "False";
}

function parseQuestions(children: Content[]): ParsedQuestion[] {
  const results: ParsedQuestion[] = [];
  let current: ParsedQuestion | null = null;

  const pushCurrent = () => {
    if (current && (current.question || current.options.length > 0)) {
      results.push(current);
    }
    current = null;
  };

  const appendLine = (text: string) => {
    if (!current) {
      current = { question: text, options: [], answer: "", explanation: "" };
      return;
    }
    if (current.explanation) {
      current.explanation = `${current.explanation} ${text}`.trim();
    } else if (current.answer) {
      current.answer = `${current.answer} ${text}`.trim();
    } else if (current.options.length === 0) {
      current.question = `${current.question} ${text}`.trim();
    }
  };

  for (const node of children) {
    if (node.type === "paragraph") {
      for (const line of textOf(node).split("\n")) {
        const text = line.trim();
        if (!text) continue;

        const questionMatch = text.match(QUESTION_RE);
        if (questionMatch) {
          pushCurrent();
          current = { question: questionMatch[1].trim(), options: [], answer: "", explanation: "" };
          continue;
        }

        const statementMatch = text.match(STATEMENT_RE);
        if (statementMatch && !current) {
          current = { question: statementMatch[1].trim(), options: [], answer: "", explanation: "" };
          continue;
        }

        const answerMatch = text.match(ANSWER_RE);
        if (answerMatch && current) {
          current.answer = answerMatch[1].trim();
          continue;
        }

        const explanationMatch = text.match(EXPLANATION_RE);
        if (explanationMatch && current) {
          current.explanation = explanationMatch[1].trim();
          continue;
        }

        appendLine(text);
      }
    } else if (node.type === "list") {
      if (!current) current = { question: "", options: [], answer: "", explanation: "" };
      current.options.push(
        ...(node as { children: Content[] }).children.map((item) => textOf(item).trim()),
      );
    }
  }

  pushCurrent();
  return results;
}

function buildWidgetHtml(widget: Widget): string {
  const cardClasses =
    "not-prose my-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70";

  if (widget.type === "trufalse") {
    const q = widget.questions[0];
    const payload = JSON.stringify({
      type: "trufalse",
      question: q.question,
      answer: q.answer,
      explanation: q.explanation,
    });
    const fallback = `
      <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-pink-600 dark:text-pink-400">True or False</p>
      <p class="mb-3 font-medium text-zinc-900 dark:text-zinc-50">${escapeHtml(q.question)}</p>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">True</span>
        <span class="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">False</span>
      </div>
      <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Pick an answer to reveal the explanation.</p>`;
    return `<div class="${cardClasses} p-5 sm:p-6" data-widget="trufalse" data-payload="${escapeHtml(payload)}">${fallback}</div>`;
  }

  const payload = JSON.stringify({ type: "quiz", questions: widget.questions });
  const fallback = widget.questions
    .map((q, index) => {
      const options = q.options
        .map(
          (option) =>
            `<li class="m-0 text-sm text-zinc-600 dark:text-zinc-400">${escapeHtml(option)}</li>`,
        )
        .join("");
      return `
      <div class="mb-5">
        <p class="mb-2 font-medium text-zinc-900 dark:text-zinc-50">${index + 1}. ${escapeHtml(q.question)}</p>
        <ul class="m-0 list-none space-y-1 p-0">${options}</ul>
      </div>`;
    })
    .join("");
  return `<div class="${cardClasses} p-5 sm:p-6" data-widget="quiz" data-payload="${escapeHtml(payload)}">${fallback}</div>`;
}

const remarkWidgets: Plugin = () =>
  ((tree: Root) => {
    const nextChildren: Content[] = [];

    for (const node of tree.children) {
      if (node.type !== "containerDirective") {
        nextChildren.push(node);
        continue;
      }

      const directive = node as DirectiveNode;
      if (directive.name !== "quiz" && directive.name !== "trufalse") {
        nextChildren.push(node);
        continue;
      }

      const questions = parseQuestions(directive.children);
      if (questions.length === 0) {
        nextChildren.push(node);
        continue;
      }

      const widget: Widget = {
        type: directive.name as Widget["type"],
        questions:
          directive.name === "trufalse"
            ? [{ ...questions[0], answer: normalizeTrueFalse(questions[0].answer) }]
            : questions,
      };

      const htmlNode: Html = { type: "html", value: buildWidgetHtml(widget) };
      nextChildren.push(htmlNode);
    }

    tree.children = nextChildren;
  }) as unknown as Transformer;

export default remarkWidgets;
