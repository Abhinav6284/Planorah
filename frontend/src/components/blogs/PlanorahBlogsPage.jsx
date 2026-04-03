import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { planorahBlogs } from "../../data/planorahBlogs";

const tierStyles = {
  1: {
    color: "text-terracotta dark:text-orange-400",
    bg: "bg-terracotta/10 dark:bg-terracotta/20",
    border: "border-terracotta/30 dark:border-terracotta/40",
    glow: "shadow-[0_0_15px_rgba(227,93,79,0.3)]",
  },
  2: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/30 dark:border-emerald-500/40",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  },
  3: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/30 dark:border-blue-500/40",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  4: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    border: "border-purple-500/30 dark:border-purple-500/40",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  },
};

export default function PlanorahBlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlug = searchParams.get("article");

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePos({
      x: (clientX / window.innerWidth) * 100,
      y: (clientY / window.innerHeight) * 100,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Determine mode: listing or direct article viewing
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
    <div className="relative min-h-screen bg-[#faf9f6] text-[#111111] dark:bg-[#070707] dark:text-[#f3f3f3] font-sans overflow-hidden selection:bg-terracotta/30 selection:text-terracotta-900 dark:selection:text-white">
      
      {/* Extreme Dynamic Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden mix-blend-screen dark:mix-blend-screen opacity-60 dark:opacity-40">
        <div
          className="absolute -top-64 -left-64 h-[50rem] w-[50rem] rounded-full bg-terracotta/10 blur-[140px] opacity-70 dark:bg-terracotta/15 transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
        />
        <div
          className="absolute top-[20%] right-[-10%] h-[60rem] w-[60rem] rounded-full bg-sage/10 blur-[160px] opacity-50 dark:bg-sage/10 transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${-mousePos.x * 0.15}px, ${-mousePos.y * 0.15}px)` }}
        />
        <div
          className="absolute -bottom-64 left-[20%] h-[40rem] w-[60rem] rounded-full bg-amber-500/5 blur-[120px] opacity-40 dark:bg-terracotta/5 transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePos.x * 0.1}px, ${-mousePos.y * 0.1}px)` }}
        />
        
        {/* Noise overlay for premium texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
      </div>

      {/* Floating Crisp Header */}
      <header className="fixed top-4 inset-x-0 z-50 mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between rounded-full border border-black/5 bg-white/70 px-6 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#111111]/70 dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] saturate-150 transition-all">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="group flex items-center gap-2 text-sm font-semibold text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 group-hover:-translate-x-0.5 transition-transform">
                <ArrowLeft className="h-3 w-3" />
              </div>
              <span className="hidden sm:inline tracking-wide uppercase text-[10px]">Planorah</span>
            </Link>
            <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden sm:block"></div>
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] hidden sm:flex items-center gap-2 text-black/80 dark:text-white/80">
              <BookOpen className="h-3.5 w-3.5 text-terracotta" />
              Journal
            </span>
          </div>
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#111] px-5 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
          >
            <span className="absolute inset-0 block h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></span>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Get Started
          </Link>
        </div>
      </header>

      <main className={`relative z-10 mx-auto pt-32 pb-24 ${isArticleView ? "w-full max-w-none px-4 sm:px-8 lg:px-12" : "max-w-7xl px-4 sm:px-6 lg:px-8"}`}>  
        {!isArticleView || !activeBlog ? (
          /* =========================================
             HELLISHLY GOOD LISTING VIEW
             ========================================= */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            {/* Hero Typography Showcase */}
            <div className="mb-20 text-center flex flex-col items-center">
              <div className="inline-flex items-center justify-center rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-1.5 mb-8 shadow-[0_0_20px_rgba(227,93,79,0.1)]">
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                   The Library
                 </span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-[7rem] leading-[0.9] font-black font-playfair tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-black via-black/80 to-black/40 dark:from-white dark:via-white/90 dark:to-white/40 mb-6 drop-shadow-sm">
                Master your <br className="hidden sm:block" /> 
                <span className="italic font-light opacity-90 inline-block translate-y-1">trajectory.</span>
              </h1>
              <p className="text-lg sm:text-xl text-black/50 dark:text-white/50 max-w-2xl font-medium tracking-tight">
                No fluff. Just pure, unadulterated roadmaps and strategies to accelerate your development career.
              </p>
            </div>

            {/* Glassmorphic Hero Article */}
            {planorahBlogs.length > 0 && (
              <div className="mb-24">
                <button
                  onClick={() => openArticle(planorahBlogs[0].slug)}
                  className="group relative flex w-full flex-col md:flex-row overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/20 p-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition-all duration-700 hover:scale-[1.01] hover:bg-white/40 hover:shadow-[0_20px_80px_-20px_rgba(227,93,79,0.2)] dark:border-white/[0.08] dark:bg-black/20 dark:hover:bg-white/[0.06] dark:hover:shadow-[0_20px_80px_-20px_rgba(227,93,79,0.15)] text-left"
                >
                  <div className="relative flex flex-1 flex-col justify-center rounded-[2rem] bg-white/50 p-8 md:p-14 lg:p-16 dark:bg-black/50 backdrop-blur-xl z-10 w-full">
                    <div className="flex items-center gap-4 mb-8">
                      <span className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group-hover:${tierStyles[planorahBlogs[0].tier].glow} ${tierStyles[planorahBlogs[0].tier].bg} ${tierStyles[planorahBlogs[0].tier].color} ${tierStyles[planorahBlogs[0].tier].border}`}>
                        {planorahBlogs[0].tierLabel}
                      </span>
                      <span className="font-mono text-xs font-bold text-black/30 dark:text-white/30 tracking-widest">
                        {Math.ceil(parseInt(String(planorahBlogs[0].words || "800").replace(/\D/g, '') || 800, 10) / 200)} MIN READ
                      </span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black font-playfair tracking-tighter text-black/90 dark:text-white mb-6 transition-colors duration-500 group-hover:text-terracotta leading-[1.05]">
                      {planorahBlogs[0].title}
                    </h2>
                    <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed mb-10 max-w-2xl font-serif">
                      {planorahBlogs[0].metaDesc}
                    </p>
                    <div className="flex items-center text-sm font-black uppercase tracking-[0.1em] text-terracotta opacity-80 group-hover:opacity-100 transition-opacity">
                      Read Blueprint <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-2" />
                    </div>
                  </div>
                  
                  {/* Absolute stunner side-art */}
                  <div className="hidden md:block w-2/5 overflow-hidden rounded-[2rem] bg-[#111] relative border-l border-white/10 dark:border-white/5 m-2 relative z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-terracotta/40 via-transparent to-transparent opacity-50 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="flex h-full w-full items-center justify-center">
                       <span className="text-[12rem] font-black font-playfair text-white/[0.03] rotate-[-15deg] transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-[-5deg]">
                         {String(0 + 1).padStart(2, '0')}
                       </span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center mb-16">
              <div className="h-px w-full max-w-sm bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10"></div>
              <h3 className="mx-6 text-xs font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40 whitespace-nowrap">
                The Archives
              </h3>
              <div className="h-px w-full max-w-sm bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10"></div>
            </div>

            {/* Extreme Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {planorahBlogs.slice(1).map((blog, idx) => {
                const actualIndex = idx + 1;
                return (
                  <button
                    key={blog.slug}
                    onClick={() => openArticle(blog.slug)}
                    className="group relative flex flex-col items-start text-left outline-none"
                  >
                    {/* Hover Glow Behind Card */}
                    <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-terracotta/0 to-terracotta/0 opacity-0 blur-xl transition-all duration-700 group-hover:from-terracotta/20 group-hover:to-transparent group-hover:opacity-100 dark:group-hover:from-terracotta/20"></div>
                    
                    <div className="relative w-full h-full p-6 sm:p-8 rounded-[2rem] border border-black/[0.04] bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:border-white/[0.05] dark:bg-[#111111]/80 flex flex-col">
                      
                      <div className="mb-8 flex items-center justify-between w-full">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${tierStyles[blog.tier].bg} ${tierStyles[blog.tier].color} ${tierStyles[blog.tier].border}`}>
                          {blog.tierLabel}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-black/30 dark:text-white/30 tracking-widest">
                          {String(actualIndex + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h4 className="text-2xl font-bold font-playfair tracking-tight text-black/90 dark:text-white mb-4 group-hover:text-terracotta transition-colors leading-[1.1]">
                        {blog.title}
                      </h4>
                      <p className="text-sm text-black/50 dark:text-white/50 line-clamp-3 mb-8 leading-relaxed flex-grow">
                        {blog.metaDesc}
                      </p>
                      
                      <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30 group-hover:text-terracotta transition-colors">
                        Explore <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* =========================================
             MAGAZINE EDITORIAL READING VIEW 
             ========================================= */
          <article className="animate-in fade-in zoom-in-95 duration-1000 ease-out mx-auto w-full max-w-none bg-white dark:bg-[#111] rounded-[2rem] md:rounded-[4rem] p-8 sm:p-14 lg:p-24 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.1)] border border-black/5 dark:border-white/5 relative z-20 mt-10">
            
            <button
              onClick={goBackToList}
              className="group absolute top-8 left-8 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/50 backdrop-blur-md transition-all hover:scale-110 hover:border-black/30 dark:border-white/10 dark:bg-black/50 dark:hover:border-white/30 text-black/60 dark:text-white/60 z-50"
            >
              <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <header className="mb-24 text-center mt-8 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] ${tierStyles[activeBlog.tier].bg} ${tierStyles[activeBlog.tier].color} ${tierStyles[activeBlog.tier].border}`}>
                  {activeBlog.tierLabel}
                </span>
                <span className="font-mono text-sm font-bold text-black/40 dark:text-white/40 tracking-widest uppercase">
                  {Math.ceil(parseInt(String(activeBlog.words || "800").replace(/\\D/g, '') || 800, 10) / 200)} Min Read
                </span>
                <span className="font-mono text-sm font-bold text-black/40 dark:text-white/40 tracking-widest uppercase">
                  2026 Edition
                </span>
              </div>
              
              <h1 className="mx-auto text-6xl md:text-7xl lg:text-[6rem] leading-[1.05] font-black font-playfair tracking-tighter text-black dark:text-white mb-12 drop-shadow-sm">
                {activeBlog.title}
              </h1>

              {/* Sophisticated Abstract Divider */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-24 bg-black/20 dark:bg-white/20"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-terracotta rotate-45"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-terracotta/50 rotate-45"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-terracotta rotate-45"></div>
                <div className="h-px w-24 bg-black/20 dark:bg-white/20"></div>
              </div>
            </header>

            <div
              className={`
              prose prose-xl md:prose-2xl mx-auto max-w-[900px]
              dark:prose-invert prose-p:text-[#333] dark:prose-p:text-[#ccc]
              
              /* Stunning Typography Override */
              prose-headings:font-playfair prose-headings:tracking-tight prose-headings:font-bold
              prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-black dark:prose-h2:text-white
              prose-h3:text-2xl prose-h3:text-black/80 dark:prose-h3:text-white/80
              
              prose-p:leading-[1.9] prose-p:tracking-[-0.01em] prose-p:font-serif
              
              /* First Letter Drop Cap (for the very first paragraph) */
              first-letter:text-7xl first-letter:font-black first-letter:font-playfair first-letter:text-terracotta first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]
              
              prose-a:text-terracotta prose-a:font-medium prose-a:underline prose-a:decoration-terracotta/30 prose-a:underline-offset-[6px] hover:prose-a:decoration-terracotta transition-all
              
              prose-blockquote:border-l-4 prose-blockquote:border-terracotta prose-blockquote:bg-gradient-to-r prose-blockquote:from-terracotta/5 prose-blockquote:to-transparent prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:font-playfair prose-blockquote:text-2xl prose-blockquote:italic prose-blockquote:text-black/70 dark:prose-blockquote:text-white/70
              
              prose-strong:text-black dark:prose-strong:text-white prose-strong:font-bold
              
              prose-ul:list-none prose-li:relative prose-li:pl-6
              marker:text-transparent
              [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:top-[0.6em] [&>ul>li::before]:h-1.5 [&>ul>li::before]:w-1.5 [&>ul>li::before]:rounded-full [&>ul>li::before]:bg-terracotta
              
              mb-24
              `}
              dangerouslySetInnerHTML={{ __html: activeBlog.content }}
            />

            {/* Premium Article Footer & Navigation */}
            <div className="border-t border-black/10 dark:border-white/10 pt-16 mt-16">
              
              <div className="relative overflow-hidden rounded-[2.5rem] p-1 bg-[#111] dark:bg-white text-white dark:text-black mb-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta/40 via-transparent to-transparent mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 rounded-[2.25rem] border border-white/10 dark:border-black/10 p-10 md:p-14 backdrop-blur-md bg-black/40 dark:bg-white/40">
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-black font-playfair tracking-tight mb-4">Execute this knowledge.</h3>
                    <p className="text-white/60 dark:text-black/60 max-w-md text-lg">
                      Turn this roadmap into actionable daily tasks and habits using Planorah's AI engine.
                    </p>
                  </div>
                  <Link
                    to="/register"
                    className="shrink-0 rounded-full bg-terracotta px-8 py-4 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_30px_rgba(227,93,79,0.4)] transition-all hover:scale-105 hover:bg-terracottaHover active:scale-95"
                  >
                    Build My Plan
                  </Link>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {activeArticleIndex > 0 ? (
                  <button
                    onClick={() => selectNextArticle(-1)}
                    className="group flex-1 p-8 text-left border border-black/5 dark:border-white/5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-white dark:hover:bg-[#151515] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-4 flex items-center">
                      <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" />
                      Previous Dispatch
                    </div>
                    <div className="font-bold font-playfair text-2xl text-black dark:text-white line-clamp-2 leading-[1.2]">
                      {planorahBlogs[activeArticleIndex - 1].title}
                    </div>
                  </button>
                ) : <div className="flex-1" />}

                {activeArticleIndex < planorahBlogs.length - 1 ? (
                  <button
                    onClick={() => selectNextArticle(1)}
                    className="group flex-1 p-8 text-right border border-black/5 dark:border-white/5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-white dark:hover:bg-[#151515] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-4 flex items-center justify-end">
                      Next Dispatch
                      <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="font-bold font-playfair text-2xl text-black dark:text-white line-clamp-2 leading-[1.2]">
                      {planorahBlogs[activeArticleIndex + 1].title}
                    </div>
                  </button>
                ) : <div className="flex-1" />}
              </div>
            </div>
          </article>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}
