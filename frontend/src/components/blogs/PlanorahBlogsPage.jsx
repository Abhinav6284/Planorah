import React, { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { planorahBlogs } from "../../data/planorahBlogs";

export default function PlanorahBlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlug = searchParams.get("article");

  const isArticleView = !!requestedSlug;

  const activeArticleIndex = useMemo(() => {
    if (!requestedSlug) return -1;
    return planorahBlogs.findIndex((item) => item.slug === requestedSlug);      
  }, [requestedSlug]);

  const activeBlog = activeArticleIndex >= 0 ? planorahBlogs[activeArticleIndex] : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [requestedSlug]);

  const openArticle = (slug) => {
    setSearchParams({ article: slug });
  };

  const goBackToList = () => {
    setSearchParams({});
  };

  const selectNextArticle = (offset) => {
    const newIdx = activeArticleIndex + offset;
    if (newIdx >= 0 && newIdx < planorahBlogs.length) {
      setSearchParams({ article: planorahBlogs[newIdx].slug });
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] font-inter text-[var(--fg)] selection:bg-[var(--fg)] selection:text-[var(--bg)]">
      <main className={`relative z-10 mx-auto py-24 ${isArticleView ? "w-full max-w-3xl px-6" : "max-w-7xl px-4 sm:px-6 lg:px-8"}`}>  
        {!isArticleView || !activeBlog ? (
          /* =========================================
             MINIMALIST LISTING VIEW
             ========================================= */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <header className="mb-20 text-center max-w-3xl mx-auto">
              <h1 className="font-cal-sans text-5xl md:text-6xl font-bold tracking-tight text-[var(--fg-deep)] mb-6">
                Journal
              </h1>
              <p className="text-lg md:text-xl text-[var(--fg-muted)] leading-relaxed">
                Insights, roadmaps, and guides for the modern student.
              </p>
            </header>

            {/* Featured Article */}
            {planorahBlogs.length > 0 && (
              <div className="mb-24 group relative">
                <button
                  onClick={() => openArticle(planorahBlogs[0].slug)}
                  className="w-full text-left bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                        {planorahBlogs[0].tierLabel}
                      </span>
                      <span className="text-xs font-semibold text-[var(--fg-muted)] tracking-wider uppercase">
                        {Math.ceil(parseInt(String(planorahBlogs[0].words || "800").replace(/\D/g, '') || 800, 10) / 200)} MIN READ
                      </span>
                    </div>
                    <h2 className="font-cal-sans text-3xl md:text-4xl font-bold tracking-tight text-[var(--fg-deep)] mb-6 group-hover:underline decoration-2 underline-offset-4">
                      {planorahBlogs[0].title}
                    </h2>
                    <p className="text-base text-[var(--fg-muted)] leading-relaxed mb-8">
                      {planorahBlogs[0].metaDesc}
                    </p>
                    <div className="flex items-center text-sm font-bold text-[var(--fg)] uppercase tracking-widest">
                      Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="hidden md:flex w-2/5 border-l border-[var(--border-subtle)] bg-[var(--bg)] items-center justify-center relative overflow-hidden">
                     <span className="text-[10rem] font-bold text-[var(--fg-muted)] opacity-10 -rotate-12 transition-transform duration-700 group-hover:scale-110">
                       01
                     </span>
                  </div>
                </button>
              </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {planorahBlogs.slice(1).map((blog, idx) => {
                const actualIndex = idx + 1;
                return (
                  <button
                    key={blog.slug}
                    onClick={() => openArticle(blog.slug)}
                    className="group flex flex-col text-left bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="mb-6 flex items-center justify-between w-full">
                      <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                        {blog.tierLabel}
                      </span>
                      <span className="text-xs font-bold text-[var(--fg-muted)] opacity-50 tracking-widest">
                        {String(actualIndex + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h4 className="font-cal-sans text-xl font-bold tracking-tight text-[var(--fg-deep)] mb-4 group-hover:underline decoration-2 underline-offset-4 leading-snug">
                      {blog.title}
                    </h4>
                    <p className="text-sm text-[var(--fg-muted)] line-clamp-3 mb-8 leading-relaxed flex-grow">
                      {blog.metaDesc}
                    </p>
                    
                    <div className="mt-auto flex items-center text-[11px] font-bold uppercase tracking-widest text-[var(--fg)]">
                      Explore <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* =========================================
             MINIMALIST ARTICLE VIEW 
             ========================================= */
          <article className="animate-in fade-in duration-500 relative z-20">
            <button
              onClick={goBackToList}
              className="group flex items-center text-sm font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-deep)] mb-12 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to Journal
            </button>

            <header className="mb-16">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                  {activeBlog.tierLabel}
                </span>
                <span className="text-xs font-semibold text-[var(--fg-muted)] tracking-wider uppercase">
                  {Math.ceil(parseInt(String(activeBlog.words || "800").replace(/\D/g, '') || 800, 10) / 200)} Min Read
                </span>
              </div>
              
              <h1 className="font-cal-sans text-4xl md:text-5xl font-bold tracking-tight text-[var(--fg-deep)] mb-8 leading-[1.1]">
                {activeBlog.title}
              </h1>
              
              <p className="text-lg md:text-xl text-[var(--fg-muted)] leading-relaxed">
                {activeBlog.metaDesc}
              </p>
            </header>

            <div 
              className="prose prose-lg dark:prose-invert prose-headings:font-cal-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--fg-deep)] prose-p:text-[var(--fg-muted)] prose-p:leading-relaxed prose-a:text-[var(--fg-deep)] prose-a:underline hover:prose-a:opacity-80 prose-strong:text-[var(--fg-deep)] max-w-none"
              dangerouslySetInnerHTML={{ __html: activeBlog.content }}
            />

            <div className="mt-24 pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                onClick={() => selectNextArticle(-1)}
                disabled={activeArticleIndex <= 0}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--fg)] font-semibold text-sm hover:bg-[var(--bg)] transition-colors disabled:opacity-50 flex items-center justify-center group"
              >
                <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Previous
              </button>
              
              <button 
                onClick={() => selectNextArticle(1)}
                disabled={activeArticleIndex >= planorahBlogs.length - 1}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--fg)] font-semibold text-sm hover:bg-[var(--bg)] transition-colors disabled:opacity-50 flex items-center justify-center group"
              >
                Next <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
