import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hasAdminSession } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase";
import { projectInputSchema } from "@/lib/validation";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const { data, error } = await getAdminSupabase()
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ projects: data });
  } catch (error) {
    return NextResponse.json({ error: safeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const file = form.get("file");
  let mediaUrl = String(form.get("media_url") || "").trim();
  let uploadedPath: string | null = null;
  const client = getAdminSupabase();

  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES || !allowedTypes.has(file.type)) {
        return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or AVIF image up to 12 MB." }, { status: 400 });
      }
      const extension = file.type.split("/")[1].replace("jpeg", "jpg");
      uploadedPath = `${randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage
        .from("portfolio-media")
        .upload(uploadedPath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = client.storage.from("portfolio-media").getPublicUrl(uploadedPath);
      mediaUrl = data.publicUrl;
    }

    const rawTags = String(form.get("skills_tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const parsed = projectInputSchema.safeParse({
      title: form.get("title"),
      category: form.get("category"),
      description: form.get("description"),
      client_name: form.get("client_name") || "",
      media_url: mediaUrl,
      video_url: form.get("video_url") || null,
      skills_tags: rawTags
    });
    if (!parsed.success) {
      if (uploadedPath) await client.storage.from("portfolio-media").remove([uploadedPath]);
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the project details." }, { status: 400 });
    }

    const { data, error } = await client.from("projects").insert(parsed.data).select().single();
    if (error) throw error;
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    if (uploadedPath) await client.storage.from("portfolio-media").remove([uploadedPath]);
    return NextResponse.json({ error: safeErrorMessage(error) }, { status: 503 });
  }
}
