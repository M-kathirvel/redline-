import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase";
import { projectUpdateSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

function getPortfolioObjectPath(mediaUrl: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("Supabase server credentials are not configured.");

  const media = new URL(mediaUrl);
  const supabase = new URL(supabaseUrl);
  const storagePrefix = "/storage/v1/object/public/portfolio-media/";
  if (media.origin !== supabase.origin || !media.pathname.startsWith(storagePrefix)) return null;

  let objectPath: string;
  try {
    objectPath = media.pathname
      .slice(storagePrefix.length)
      .split("/")
      .map(decodeURIComponent)
      .join("/");
  } catch {
    throw new Error("The project file URL is invalid.");
  }
  if (!objectPath || objectPath.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("The project file URL is invalid.");
  }
  return objectPath;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id: projectId } = await params;
  const parsed = projectUpdateSchema.safeParse({ ...(body as object), id: projectId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the project details." }, { status: 400 });
  }

  try {
    const { id, ...values } = parsed.data;
    const { data, error } = await getAdminSupabase()
      .from("projects")
      .update(values)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ project: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update project." }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const { id: projectId } = await params;
    const client = getAdminSupabase();
    const { data: project, error: readError } = await client
      .from("projects")
      .select("media_url")
      .eq("id", projectId)
      .single();
    if (readError) throw readError;

    const objectPath = getPortfolioObjectPath(project.media_url);
    if (objectPath) {
      const { error: storageError } = await client.storage.from("portfolio-media").remove([objectPath]);
      if (storageError) throw storageError;
    }

    const { error } = await client.from("projects").delete().eq("id", projectId);
    if (error) throw error;

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete project." }, { status: 503 });
  }
}
