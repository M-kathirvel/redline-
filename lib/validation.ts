import { z } from "zod";
import { PROJECT_CATEGORIES } from "@/lib/constants";

const cleanText = (max: number) =>
  z.string().trim().min(1).max(max).transform((value) =>
    value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/<[^>]*>/g, "")
  );

const httpUrl = z.string().trim().url().refine((value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "URL must use HTTP or HTTPS.");

export const projectInputSchema = z.object({
  title: cleanText(120),
  category: z.enum(PROJECT_CATEGORIES),
  description: cleanText(2000),
  client_name: z.string().trim().max(120).transform((value) =>
    value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/<[^>]*>/g, "")
  ).optional().default(""),
  media_url: httpUrl,
  video_url: z.preprocess(
    (value) => value === "" ? null : value,
    httpUrl.nullable().optional()
  ).transform((value) => value ?? null),
  skills_tags: z.array(z.string().trim().min(1).max(40)).max(15).default([])
});

export const projectUpdateSchema = projectInputSchema.extend({
  id: z.string().uuid()
});

export const statsSchema = z.object({
  completed_projects_count: z.number().int().min(0).max(10000000)
});
