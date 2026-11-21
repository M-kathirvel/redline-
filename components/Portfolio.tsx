"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PORTFOLIO_FILTERS } from "@/lib/constants";
import type { ProjectCategory } from "@/lib/constants";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  client_name: string | null;
  media_url: string;
  video_url: string | null;
  skills_tags: string[] | null;
};

const sampleProjects: Project[] = [
  { id: "sample-1", title: "Hospitality identity concept", category: "Branding", description: "An independent visual direction exploring a distinctive identity system for a hospitality brand.", client_name: "Uncommissioned concept", media_url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=85", video_url: null, skills_tags: ["Identity", "Art direction"] },
  { id: "sample-2", title: "Social launch concept", category: "Social Media", description: "A speculative social content direction built around a consistent product story.", client_name: "Uncommissioned concept", media_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85", video_url: null, skills_tags: ["Social", "Creative"] },
  { id: "sample-3", title: "Performance campaign concept", category: "Ads", description: "An independent campaign concept exploring creative variations for customer acquisition.", client_name: "Uncommissioned concept", media_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85", video_url: null, skills_tags: ["Performance", "Creative"] }
];

function getExternalVideoUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

export default function Portfolio({ projects, showSamples }: { projects: Project[]; showSamples: boolean }) {
  const [filter, setFilter] = useState<(typeof PORTFOLIO_FILTERS)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const items = useMemo(() => projects.length ? projects : showSamples ? sampleProjects : [], [projects, showSamples]);
  const filtered = useMemo(() => filter === "All" ? items : items.filter((item) => item.category === filter), [filter, items]);
  const selectedVideoUrl = selected ? getExternalVideoUrl(selected.video_url) : null;

  return (
    <>
      <div className="mb-9 flex flex-wrap gap-2">
        {PORTFOLIO_FILTERS.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition ${filter === item ? "border-red-600 bg-red-600 text-white" : "border-[#303030] text-[#999] hover:border-red-700 hover:text-white"}`}>
            {item}
          </button>
        ))}
      </div>
      {filtered.length > 0 && <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.button
              key={project.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              type="button"
              onClick={() => setSelected(project)}
              className="portfolio-card group overflow-hidden border border-[#282828] bg-[#0d0d0d] text-left transition hover:border-[#8c1d27]"
            >
              <div className="relative aspect-[1.25] overflow-hidden bg-[#171717]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="portfolio-image h-full w-full object-cover opacity-80 group-hover:opacity-100" src={project.media_url} alt={project.title} loading="lazy" />
                <span className="absolute left-4 top-4 border border-white/20 bg-black/70 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest">{project.category}</span>
                <span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-red-600 text-lg opacity-0 transition group-hover:opacity-100">↗</span>
              </div>
              <div className="p-5">
                <p className="small-label">{project.client_name || "Selected work"}</p>
                <h3 className="mt-2 text-xl font-black tracking-tight">{project.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#999]">{project.description}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>}
      {filtered.length === 0 && <p className="py-16 text-center text-sm text-[#888]">No projects in this category yet.</p>}
      <AnimatePresence>
        {selected && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="modal-panel" initial={{ scale: .96, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .97 }} onClick={(event) => event.stopPropagation()}>
              <button onClick={() => setSelected(null)} className="float-right text-xl text-[#888]" aria-label="Close project preview">×</button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.media_url} alt={selected.title} className="mb-6 max-h-[50vh] w-full object-cover" />
              <p className="eyebrow">{selected.category} · {selected.client_name || "Selected work"}</p>
              <h3 className="mt-3 text-3xl font-black">{selected.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#aaa]">{selected.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">{selected.skills_tags?.map((tag) => <span key={tag} className="border border-[#333] px-2.5 py-1 text-[10px] text-[#aaa]">{tag}</span>)}</div>
              {selectedVideoUrl && (
                <a
                  href={selectedVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary mt-6 w-fit"
                >
                  Watch Video / View Reel <span aria-hidden="true">↗</span>
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
