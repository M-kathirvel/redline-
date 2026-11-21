import Link from "next/link";
import ContactModals from "@/components/ContactModals";
import HeroScene from "@/components/HeroScene";
import Portfolio, { Project } from "@/components/Portfolio";
import ProjectMetric from "@/components/ProjectMetric";
import Services3D from "@/components/Services3D";
import { getPublicSupabase } from "@/lib/supabase";

async function loadShowcase() {
  const supabase = getPublicSupabase();
  if (!supabase) return { projects: [] as Project[], count: 150, databaseReady: false };

  const [projectResult, statsResult] = await Promise.all([
    supabase.from("projects").select("id,title,category,description,client_name,media_url,video_url,skills_tags").order("created_at", { ascending: false }),
    supabase.from("site_stats").select("completed_projects_count").eq("id", 1).maybeSingle()
  ]);
  if (projectResult.error) console.error("Could not load portfolio projects:", projectResult.error.message);
  if (statsResult.error) console.error("Could not load project counter:", statsResult.error.message);
  return {
    projects: (projectResult.data || []) as Project[],
    count: statsResult.data?.completed_projects_count ?? 150,
    databaseReady: !projectResult.error && !statsResult.error
  };
}

export default async function HomePage() {
  const { projects, count, databaseReady } = await loadShowcase();
  return (
    <main>
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="container-wide flex h-[82px] items-center justify-between border-b border-white/10">
          <a href="#" className="flex items-center gap-3" aria-label="Redline Marketing home">
            <span className="grid h-9 w-9 place-items-center bg-red-600 text-lg font-black">R</span>
            <span className="text-sm font-black uppercase tracking-[.13em]">Redline <span className="text-[#aaa]">Marketing</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-[10px] font-bold uppercase tracking-[.16em] text-[#aaa] md:flex">
            <a className="hover:text-white" href="#services">Services</a>
            <a className="hover:text-white" href="#work">Selected work</a>
            <a className="hover:text-white" href="#contact">Contact</a>
          </nav>
          <Link className="button-primary !min-h-10 !px-4 !text-[9px]" href="#contact">Let&apos;s talk <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <section className="relative flex min-h-[760px] items-center overflow-hidden pt-20 md:min-h-[850px]">
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="hero-glow absolute inset-0" />
        <HeroScene />
        <div className="container-wide relative z-10 py-24">
          <div className="max-w-[840px]">
            <div className="hero-wordmark mb-7 inline-block rounded border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-sm">
              <div className="logo-word text-4xl font-black sm:text-5xl">R<span className="logo-e">E</span>DLINE</div>
              <div className="logo-underline" />
              <p className="logo-script mt-1 text-right text-xs tracking-[.12em] text-[#aaa]">Marketing</p>
            </div>
            <p className="eyebrow mb-7 flex items-center gap-3"><span className="red-rule" /> Coimbatore, India · Independent digital growth partner</p>
            <h1 className="display-heading text-[clamp(58px,11vw,138px)]">
              MAKE YOUR<br /><span className="outline-word">BRAND</span> <span className="red-text">UNMISSABLE.</span>
            </h1>
            <p className="mt-8 max-w-[530px] text-sm leading-7 text-[#aaa] sm:text-base">
              We build brands, create demand, and turn attention into momentum. Strategy-led digital marketing for ambitious businesses.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contact" className="button-primary">Start a conversation <span aria-hidden="true">↗</span></a>
              <a href="#work" className="button-quiet">Explore our work</a>
            </div>
            <p className="mt-10 max-w-2xl text-[10px] font-bold uppercase leading-6 tracking-[.12em] text-[#777]">
              Social media <span className="px-1 text-red-600">•</span> Branding <span className="px-1 text-red-600">•</span> Ads <span className="px-1 text-red-600">•</span> SEO <span className="px-1 text-red-600">•</span> Content <span className="px-1 text-red-600">•</span> Strategy <span className="px-1 text-red-600">•</span> Promotion shoots
            </p>
          </div>
          <div className="absolute bottom-8 right-0 hidden text-right md:block">
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#777]">Scroll to explore</p>
            <div className="mx-auto mt-3 h-12 w-px bg-gradient-to-b from-red-600 to-transparent" />
          </div>
        </div>
      </section>

      <ProjectMetric count={count} />

      <section id="services" className="section-padding container-wide scroll-mt-20">
        <div className="mb-12 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 className="display-heading section-title mt-4">BUILT TO MOVE<br />YOUR <span className="red-text">BUSINESS.</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#888]">One connected team. The right mix of creative, media, and strategy for your next stage.</p>
        </div>
        <Services3D />
      </section>

      <section id="work" className="section-padding scroll-mt-12 border-y border-[#1d1d1d] bg-[#080808]">
        <div className="container-wide">
          <div className="mb-11 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="display-heading section-title mt-4">WORK THAT<br /><span className="red-text">WORKS.</span></h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#888]">A sample of the stories, campaigns, and identities we make with our clients.</p>
          </div>
          {!databaseReady && <p className="mb-6 border-l-2 border-red-700 bg-[#110c0c] px-4 py-3 text-xs text-[#aaa]">Connect Supabase and apply <code>supabase/schema.sql</code> to publish live portfolio work. Sample previews are shown for now.</p>}
          <Portfolio projects={projects} showSamples={!databaseReady} />
        </div>
      </section>

      <section className="container-wide py-14">
        <div className="flex flex-col justify-between gap-7 border-b border-[#262626] pb-12 md:flex-row md:items-center">
          <div>
            <p className="eyebrow">Have a good one in mind?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Let&apos;s make it <span className="red-text">happen.</span></h2>
          </div>
          <a href="#contact" className="button-primary w-fit">Tell us about it ↗</a>
        </div>
      </section>

      <section id="contact" className="section-padding scroll-mt-10 bg-[#090909]">
        <div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Contact Redline</p>
            <h2 className="display-heading mt-4 text-6xl sm:text-7xl">LET&apos;S<br /><span className="red-text">TALK.</span></h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#999]">Tell us where you want to go. We&apos;ll bring the right people and a clear plan to help get you there.</p>
            <div className="mt-9 space-y-4 text-sm">
              <p><span className="small-label block mb-1">Based in</span>Coimbatore, Tamil Nadu, India</p>
              <p><span className="small-label block mb-1">Email</span><a className="hover:text-red-400" href={`mailto:redlinemarketinginfo@gmail.com`}>redlinemarketinginfo@gmail.com</a></p>
            </div>
          </div>
          <div className="surface-card p-6 sm:p-9">
            <p className="mb-1 text-lg font-black">Your next move starts here.</p>
            <p className="mb-5 text-xs text-[#888]">Choose a teammate or contact us on your preferred channel.</p>
            <ContactModals />
          </div>
        </div>
      </section>
      <footer className="border-t border-[#242424] py-6">
        <div className="container-wide flex flex-col justify-between gap-3 text-[10px] text-[#777] sm:flex-row">
          <p>© {new Date().getFullYear()} Redline Marketing. Made for momentum.</p>
          <a href="https://instagram.com/redlinemarketing_co" target="_blank" rel="noreferrer" className="uppercase tracking-widest hover:text-white">@redlinemarketing_co ↗</a>
        </div>
      </footer>
    </main>
  );
}
