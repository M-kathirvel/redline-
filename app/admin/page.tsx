"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import type { Project } from "@/components/Portfolio";

type ProjectForm = {
  title: string;
  category: string;
  description: string;
  client_name: string;
  media_url: string;
  video_url: string;
  skills_tags: string;
};
const emptyForm: ProjectForm = { title: "", category: "Branding", description: "", client_name: "", media_url: "", video_url: "", skills_tags: "" };

async function readJson(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [count, setCount] = useState(150);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load(): Promise<boolean> {
    setLoading(true);
    setError("");
    try {
      const [projectData, statsData] = await Promise.all([
        fetch("/api/admin/projects").then(readJson),
        fetch("/api/admin/stats").then(readJson)
      ]);
      setProjects(projectData.projects);
      setCount(statsData.completed_projects_count);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load admin data.");
      return false;
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function editProject(project: Project) {
    setEditing(project.id);
    setFile(null);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      client_name: project.client_name || "",
      media_url: project.media_url,
      video_url: project.video_url || "",
      skills_tags: project.skills_tags?.join(", ") || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let response: Response;
      if (editing) {
        response = await fetch(`/api/admin/projects/${editing}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, skills_tags: form.skills_tags.split(",").map((tag) => tag.trim()).filter(Boolean) })
        });
      } else {
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.set(key, value));
        if (file) data.set("file", file);
        response = await fetch("/api/admin/projects", { method: "POST", body: data });
      }
      await readJson(response);
      setNotice(editing ? "Project updated." : "Project published.");
      setForm(emptyForm);
      setFile(null);
      setEditing(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save project.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProject(project: Project) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    setDeletingId(project.id);
    try {
      await readJson(await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" }));
      const refreshed = await load();
      setNotice(refreshed ? "Project deleted." : "Project deleted, but the list could not be refreshed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  async function saveCount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const data = await readJson(await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed_projects_count: count })
      }));
      setCount(data.completed_projects_count);
      setNotice("Project counter updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the counter.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#070707]">
      <header className="border-b border-[#262626]">
        <div className="container-wide flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-red-600 font-black">R</span>
            <span className="text-xs font-black uppercase tracking-[.13em]">Redline <span className="text-[#888]">Studio</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-[#999] hover:text-white">View site ↗</Link>
            <button onClick={logout} className="button-quiet !min-h-9 !px-3 !text-[9px]">Sign out</button>
          </div>
        </div>
      </header>
      <div className="container-wide py-10 sm:py-14">
        <p className="eyebrow">Content management</p>
        <h1 className="display-heading mt-3 text-5xl sm:text-7xl">ADMIN <span className="red-text">DASHBOARD.</span></h1>
        <p className="mt-4 text-sm text-[#888]">Manage public portfolio work and the completed-projects metric.</p>

        {(error || notice) && <div role={error ? "alert" : "status"} className={`mt-7 border-l-2 px-4 py-3 text-sm ${error ? "border-red-500 bg-red-950/30 text-red-200" : "border-red-700 bg-[#111] text-[#ddd]"}`}>{error || notice}</div>}

        <div className="mt-9 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <section className="surface-card p-6 sm:p-8">
            <p className="eyebrow">Public site metric</p>
            <h2 className="mt-2 text-2xl font-black">Successful projects</h2>
            <form onSubmit={saveCount} className="mt-5">
              <div className="field"><label htmlFor="completed-count">Completed project count</label><input id="completed-count" type="number" min={0} max={10000000} step={1} value={count} onChange={(event) => setCount(Number(event.target.value))} required /></div>
              <button className="button-primary mt-5 w-full">Save project count</button>
            </form>
          </section>

          <section className="surface-card p-6 sm:p-8">
            <p className="eyebrow">{editing ? "Edit work" : "Publish work"}</p>
            <h2 className="mt-2 text-2xl font-black">{editing ? "Update project" : "Add a portfolio project"}</h2>
            <form onSubmit={saveProject} className="mt-3">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <div className="field"><label htmlFor="title">Project title *</label><input id="title" name="title" value={form.title} onChange={updateField} maxLength={120} required /></div>
                <div className="field"><label htmlFor="category">Category *</label><select id="category" name="category" value={form.category} onChange={updateField}>{PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
                <div className="field"><label htmlFor="client_name">Client name</label><input id="client_name" name="client_name" value={form.client_name} onChange={updateField} maxLength={120} /></div>
                <div className="field"><label htmlFor="skills_tags">Skills / tags (comma separated)</label><input id="skills_tags" name="skills_tags" value={form.skills_tags} onChange={updateField} placeholder="Strategy, Creative, SEO" /></div>
              </div>
              <div className="field"><label htmlFor="description">Summary *</label><textarea id="description" name="description" value={form.description} onChange={updateField} maxLength={2000} required /></div>
              <div className="field"><label htmlFor="media_url">Cover image URL {!file ? "*" : ""}</label><input id="media_url" name="media_url" type="url" value={form.media_url} onChange={updateField} placeholder="https://..." required={!file} /></div>
              {!editing && <div className="field"><label htmlFor="file">Or upload cover image (JPG, PNG, WebP, AVIF · max 12 MB)</label><input id="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setFile(event.target.files?.[0] || null)} /></div>}
              <div className="field"><label htmlFor="video_url">Video / Reel link (optional)</label><input id="video_url" name="video_url" type="url" value={form.video_url} onChange={updateField} placeholder="https://www.instagram.com/reel/... or https://youtu.be/..." /></div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button disabled={saving} className="button-primary">{saving ? "Saving..." : editing ? "Save changes" : "Publish project"}</button>
                {editing && <button type="button" className="button-quiet" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel edit</button>}
              </div>
            </form>
          </section>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="eyebrow">Portfolio library</p><h2 className="mt-2 text-3xl font-black">Published projects <span className="text-[#777]">({projects.length})</span></h2></div>
            <button className="button-quiet !min-h-9 !text-[9px]" onClick={() => void load()}>Refresh</button>
          </div>
          {loading ? <p className="py-12 text-sm text-[#888]">Loading projects...</p> : projects.length === 0 ? <p className="surface-card mt-5 p-7 text-sm text-[#888]">No projects yet. Publish your first case study above.</p> : (
            <div className="mt-5 divide-y divide-[#242424] border-y border-[#242424]">
              {projects.map((project) => (
                <article key={project.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">{project.category} · {project.client_name || "No client name"}</p>
                    <h3 className="mt-1 truncate font-bold">{project.title}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-[#888]">{project.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button className="button-quiet !min-h-9 !px-3 !text-[9px]" onClick={() => editProject(project)}>Edit</button>
                    <button disabled={deletingId === project.id} className="button-quiet !min-h-9 !border-red-900 !px-3 !text-[9px] !text-red-300 hover:!border-red-600 hover:!bg-red-950/50 disabled:cursor-wait disabled:opacity-60" onClick={() => void removeProject(project)}>{deletingId === project.id ? "Deleting..." : "Delete"}</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
