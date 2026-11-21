import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase";
import { statsSchema } from "@/lib/validation";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const { data, error } = await getAdminSupabase()
      .from("site_stats")
      .select("completed_projects_count")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return NextResponse.json({ completed_projects_count: data.completed_projects_count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load stats." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = statsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a whole number from 0 to 10,000,000." }, { status: 400 });
  }
  try {
    const { data, error } = await getAdminSupabase()
      .from("site_stats")
      .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() })
      .select("completed_projects_count")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update stats." }, { status: 503 });
  }
}
