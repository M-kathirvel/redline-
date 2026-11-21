"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const services = [
  { number: "01", name: "Social Media", description: "Build a recognizable, active community with social-first creative and consistent publishing.", deliverables: "Content calendars · Reels & posts · Community management", impact: "More meaningful reach and stronger audience relationships." },
  { number: "02", name: "Branding", description: "Create a distinctive visual and verbal identity your customers remember.", deliverables: "Brand identity · Visual systems · Guidelines", impact: "A cohesive presence that earns trust at every touchpoint." },
  { number: "03", name: "Ads", description: "Turn campaign budgets into trackable demand with deliberate creative and optimization.", deliverables: "Campaign setup · Ad creative · Testing & reporting", impact: "Clearer acquisition performance and smarter spend." },
  { number: "04", name: "SEO", description: "Make the right pages easier to find with technical and content-led search work.", deliverables: "SEO audit · On-page optimization · Search content", impact: "Sustainable visibility for high-intent searches." },
  { number: "05", name: "Content", description: "Tell your story through sharp, useful content made for real people and real platforms.", deliverables: "Copywriting · Creative assets · Editorial planning", impact: "More consistent communication across the customer journey." },
  { number: "06", name: "Strategy", description: "Replace guesswork with a focused plan built around your business and audience.", deliverables: "Research · Positioning · Channel roadmap", impact: "A measurable direction for the next stage of growth." },
  { number: "07", name: "Promotion Shoots", description: "Capture scroll-stopping product, team, and campaign visuals with a clear purpose.", deliverables: "Concepting · Photo & video shoot · Edited assets", impact: "Original visuals that make campaigns feel unmistakably yours." }
];

export default function Services3D() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const expanded = active === index;
        return (
          <motion.button
            key={service.number}
            type="button"
            onClick={() => setActive(expanded ? null : index)}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty("--rx", `${((event.clientY - rect.top) / rect.height - 0.5) * -4}deg`);
              event.currentTarget.style.setProperty("--ry", `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`);
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.setProperty("--rx", "0deg");
              event.currentTarget.style.setProperty("--ry", "0deg");
            }}
            className="service-card group min-h-[245px] border border-[#272727] bg-[#101010] p-6 text-left transition duration-300 hover:border-red-700 hover:shadow-[0_12px_42px_rgba(220,38,38,.12)] md:p-7"
            style={{ transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
            whileTap={{ scale: 0.985 }}
            aria-expanded={expanded}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold tracking-[.2em] text-red-500">{service.number}</span>
              <span className="text-2xl text-[#555] transition group-hover:text-red-500">{expanded ? "−" : "+"}</span>
            </div>
            <h3 className="mt-8 text-2xl font-black tracking-tight">{service.name}</h3>
            <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">{service.description}</p>
            <motion.div initial={false} animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} className="overflow-hidden">
              <div className="mt-4 border-t border-[#292929] pt-4 text-xs leading-5">
                <p><span className="text-white">Deliverables:</span> <span className="text-[#aaa]">{service.deliverables}</span></p>
                <p className="mt-2 text-red-300">{service.impact}</p>
              </div>
            </motion.div>
            {!expanded && <p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#666]">Click to explore</p>}
          </motion.button>
        );
      })}
    </div>
  );
}
