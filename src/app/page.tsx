import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:py-24">
        <header className="mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pink-600 dark:text-pink-400">
            {siteConfig.name}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            {siteConfig.description}
          </h1>
        </header>

        <section>
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Latest posts
          </h2>
          <ul className="space-y-10">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <div className="mb-2 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    <Link
                      href={`/${post.slug}`}
                      className="transition-colors hover:text-pink-600 dark:hover:text-pink-400"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {post.description}
                  </p>
                  {post.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-2xl px-6 pb-10 text-sm text-zinc-500 dark:text-zinc-400">
        &copy; {new Date().getFullYear()} {siteConfig.name}.
      </footer>
    </div>
  );
}
