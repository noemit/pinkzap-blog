import Link from "next/link";
import { getAllPostMeta } from "@/lib/posts";
import SearchBox from "./SearchBox";

export default async function Header() {
  const posts = getAllPostMeta();
  const searchPosts = posts.map(({ slug, title, description, tags }) => ({
    slug,
    title,
    description,
    tags,
  }));

  return (
    <header className="mx-auto w-full max-w-2xl px-6 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-widest text-pink-600 transition-colors hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
        >
          Pink Zap Blog
        </Link>
        <SearchBox posts={searchPosts} />
      </div>
    </header>
  );
}
