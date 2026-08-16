"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export type SearchPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

type Props = {
  posts: SearchPost[];
};

function relevance(post: SearchPost, query: string): number {
  let score = 0;
  if (post.title.toLowerCase().includes(query)) score += 4;
  if (post.tags.some((tag) => tag.toLowerCase().includes(query))) score += 2;
  if (post.description.toLowerCase().includes(query)) score += 1;
  return score;
}

export default function SearchBox({ posts }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTrackedRef = useRef<string>("");

  const trimmed = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmed) return [];
    return posts
      .filter((post) => relevance(post, trimmed) > 0)
      .sort((a, b) => relevance(b, trimmed) - relevance(a, trimmed))
      .slice(0, 6);
  }, [posts, trimmed]);

  useEffect(() => {
    if (!trimmed) return;
    const timer = setTimeout(() => {
      if (lastTrackedRef.current === trimmed) return;
      lastTrackedRef.current = trimmed;
      fetch("/api/track-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [trimmed]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const updateQuery = (value: string) => {
    setQuery(value);
    setOpen(value.trim().length > 0);
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const result = results[activeIndex];
      if (result) {
        router.push(`/${result.slug}`);
        setOpen(false);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showResults = open && results.length > 0;

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.2 13.2 3.3 3.3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search posts"
          aria-expanded={showResults}
          aria-controls="search-results"
          aria-autocomplete="list"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(query.trim().length > 0)}
          placeholder="Search posts…"
          className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {showResults && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          {results.map((result, index) => {
            const active = index === activeIndex;
            return (
              <li key={result.slug} role="option" aria-selected={active}>
                <Link
                  href={`/${result.slug}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 transition-colors ${
                    active
                      ? "bg-pink-50 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      active ? "text-pink-700 dark:text-pink-300" : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {result.title}
                  </span>
                  {result.description && (
                    <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {result.description}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
