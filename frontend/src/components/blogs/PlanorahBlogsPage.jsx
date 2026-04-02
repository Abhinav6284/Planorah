import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { planorahBlogs } from "../../data/planorahBlogs";

const tierStyles = {
  1: {
    dot: "bg-rose-500",
    badge: "border-rose-200/80 bg-rose-100/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300",
  },
  2: {
    dot: "bg-amber-500",
    badge: "border-amber-200/80 bg-amber-100/70 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  },
  3: {
    dot: "bg-sky-500",
    badge: "border-sky-200/80 bg-sky-100/70 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300",
  },
  4: {
    dot: "bg-emerald-500",
    badge: "border-emerald-200/80 bg-emerald-100/70 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
};

const tierOrder = [1, 2, 3, 4];

export default function PlanorahBlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlug = searchParams.get("article");

  const initialIndex = useMemo(() => {
    if (!requestedSlug) {
      return 0;
    }
    const foundIndex = planorahBlogs.findIndex((item) => item.slug === requestedSlug);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [requestedSlug]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const activeBlog = planorahBlogs[currentIndex] || planorahBlogs[0];

  const groupedBlogs = useMemo(() => {
    return tierOrder.map((tier) => ({
      tier,
      label: planorahBlogs.find((item) => item.tier === tier)?.tierLabel || `Tier ${tier}`,
      items: planorahBlogs
        .map((item, index) => ({ ...item, index }))
        .filter((item) => item.tier === tier),
    }));
  }, []);

  const selectBlog = (index) => {
    const bounded = Math.max(0, Math.min(index, planorahBlogs.length - 1));
    setCurrentIndex(bounded);
    setSearchParams({ article: planorahBlogs[bounded].slug }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b1019] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-24 left-[8%] h-96 w-96 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-800/20" />
        <div className="absolute top-24 right-[10%] h-[26rem] w-[26rem] rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute bottom-[-8rem] left-[18%] h-96 w-[40rem] rounded-full bg-amber-100/50 blur-3xl dark:bg-amber-700/10" />
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 md:inline-flex">
              <BookOpen className="h-4 w-4" />
              20 SEO-ready blog articles
            </div>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4" />
            Try Planorah Free
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[320px,minmax(0,1fr)] lg:px-10">
        <aside className="h-fit rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24">
          <h2 className="px-2 pb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Planorah Blog Library
          </h2>
          <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
            {groupedBlogs.map((group) => (
              <div key={group.tier}>
                <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${tierStyles[group.tier].dot}`} />
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((blog) => (
                    <button
                      key={blog.slug}
                      type="button"
                      onClick={() => selectBlog(blog.index)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        currentIndex === blog.index
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      <span className="mr-2 text-[11px] font-bold opacity-70">
                        {String(blog.index + 1).padStart(2, "0")}
                      </span>
                      {blog.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <article className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:p-10">
          <div className="mb-7 flex flex-wrap items-center gap-3 border-b border-slate-200/80 pb-6 dark:border-white/10">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${tierStyles[activeBlog.tier].badge}`}
            >
              {activeBlog.tierLabel}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Article {currentIndex + 1} of {planorahBlogs.length}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-300">
              {activeBlog.words} words
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl">
            {activeBlog.title}
          </h1>

          <div className="mt-6 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-5 dark:border-indigo-400/25 dark:bg-indigo-500/10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">
              SEO Meta Description
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{activeBlog.metaDesc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeBlog.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div
            className="planorah-blog-content mt-8"
            dangerouslySetInnerHTML={{ __html: activeBlog.content }}
          />

          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready to turn these insights into action?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Build your roadmap, structure your study flow, and track real progress with Planorah.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Start free
              </Link>
              <Link
                to="/planora"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/40 dark:hover:text-white"
              >
                Explore Planora
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
            <button
              type="button"
              onClick={() => selectBlog(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {currentIndex + 1} / {planorahBlogs.length}
            </span>

            <button
              type="button"
              onClick={() => selectBlog(currentIndex + 1)}
              disabled={currentIndex === planorahBlogs.length - 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/40"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
