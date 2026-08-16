import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import remarkWidgets from "./remark-widgets";

const contentDirectory = path.join(process.cwd(), "content");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
  content: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
};

type PostFrontmatter = {
  title: string;
  description?: string;
  date: string;
  tags?: string[];
};

function markdownToHtml(markdown: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkWidgets)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)
    .then((file) => String(file));
}

function readingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export async function getPost(slug: string): Promise<Post | null> {
  const fullPath = path.join(contentDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  if (!frontmatter.title || !frontmatter.date) return null;

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description ?? "",
    date: frontmatter.date,
    tags: frontmatter.tags ?? [],
    readingTime: readingTime(content),
    content: await markdownToHtml(content),
  };
}

function readPostMeta(slug: string): PostMeta | null {
  const fullPath = path.join(contentDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
  const frontmatter = data as PostFrontmatter;

  if (!frontmatter.title || !frontmatter.date) return null;

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description ?? "",
    date: frontmatter.date,
    tags: frontmatter.tags ?? [],
    readingTime: readingTime(content),
  };
}

export function getAllPostMeta(): PostMeta[] {
  return getAllSlugs()
    .map(readPostMeta)
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(contentDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}
