import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";

const blogs = [
  {
    tier: 1,
    slug: "web-dev-roadmap-2026",
    title: "Web Dev Roadmap 2026: The Honest Guide (No Fluff)",
    metaDesc: "A realistic, step-by-step web development roadmap for 2026. Learn exactly what to study, in what order, and how to get your first job.",
    words: "~870",
  },
  {
    tier: 1,
    slug: "ai-engineer-roadmap-bca-btech",
    title: "AI Engineer Roadmap from Zero to Job (BCA/B.Tech Edition)",
    metaDesc: "A complete, realistic roadmap to become an AI engineer in India — tailored for BCA and B.Tech students.",
    words: "~880",
  },
  {
    tier: 1,
    slug: "how-to-become-data-scientist-india",
    title: "How to Become a Data Scientist in India — Realistic Path",
    metaDesc: "Forget the hype. This is the realistic, step-by-step path to becoming a data scientist in India in 2026.",
    words: "~850",
  },
  {
    tier: 2,
    slug: "confused-about-career",
    title: "I Don't Know What to Do in Life — A Guide for Confused Students",
    metaDesc: "Feeling lost? This guide is for you. A practical, honest approach to finding direction when everything feels unclear.",
    words: "~920",
  },
  {
    tier: 2,
    slug: "study-without-burnout",
    title: "How to Actually Study Without Burning Out (The Long Game)",
    metaDesc: "Most students study wrong. This guide shows you how to build sustainable study habits that lead to better understanding.",
    words: "~780",
  },
  {
    tier: 2,
    slug: "why-notes-fail",
    title: "Why Your Notes Are Useless (And How to Fix It)",
    metaDesc: "Taking notes doesn't equal learning. Here's the science-backed approach that actually works.",
    words: "~650",
  },
  {
    tier: 3,
    slug: "how-to-read-textbooks",
    title: "How to Read a Textbook (Yes, There's a Right Way)",
    metaDesc: "Reading is not passive. Learn the active reading technique that transforms comprehension.",
    words: "~520",
  },
  {
    tier: 3,
    slug: "memory-and-spaced-repetition",
    title: "Memory Actually Works (Spaced Repetition Explained)",
    metaDesc: "Why you forget things, and the scientifically-proven technique to remember them forever.",
    words: "~740",
  },
];

const getTierLabel = (tier) => {
  const labels = {
    1: "Essential",
    2: "Core",
    3: "Advanced",
    4: "Mastery",
  };
  return labels[tier] || "Guide";
};

export default function BlogsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState(null);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.metaDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === null || blog.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Resources</p>
          <h2 className="text-5xl lg:text-6xl font-playfair font-bold text-gray-950 dark:text-white mb-6 leading-tight">
            Free guides & roadmaps
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Honest, no-fluff guides for students who want real careers. Written for Indian students, by people who've been there.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="max-w-2xl mx-auto mb-12 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 dark:focus:ring-white"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTier(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedTier === null
                  ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950"
                  : "bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]"
              }`}
            >
              All Guides
            </button>
            {["Essential", "Core", "Advanced"].map((label, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTier(idx + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedTier === idx + 1
                    ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950"
                    : "bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/[0.12] transition-all duration-300 group cursor-pointer flex flex-col"
                >
                  {/* Category Label */}
                  <div className="inline-flex w-fit px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    {getTierLabel(blog.tier)}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-outfit font-bold text-gray-950 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition line-clamp-3">
                    {blog.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
                    {blog.metaDesc}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.08]">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{blog.words}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No guides found. Try a different search.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Want to read all {blogs.length} guides?</p>
          <button className="px-8 py-3 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition">
            Browse All Guides
          </button>
        </div>
      </div>
    </section>
  );
}
