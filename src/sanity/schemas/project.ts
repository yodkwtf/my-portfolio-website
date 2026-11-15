import { defineField, defineType } from "sanity";

export const projectSchema = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (R) => R.required() }),
    defineField({
      name: "visible",
      type: "boolean",
      initialValue: true,
      description: "Toggle off to hide this project from the site without deleting its data.",
    }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (R) => R.required() }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description: "Short summary shown on cards. Required for featured projects.",
      validation: (R) =>
        R.custom((summary, context) =>
          (context.document as { featured?: boolean } | undefined)?.featured && !summary
            ? "Summary is required for featured projects"
            : true,
        ),
    }),
    defineField({
      name: "techStack",
      type: "array",
      of: [{ type: "reference", to: [{ type: "technology" }] }],
      description: "Select from existing technologies or create a new one. Shown as pills on project cards.",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
      description: "Featured projects appear on the home page (max 3). Requires a summary.",
    }),
    defineField({
      name: "clientWork",
      type: "boolean",
      initialValue: false,
      description: "Mark as client/freelance work. Client projects show a lock note when their README is not reachable.",
    }),
    defineField({ name: "githubUrl", type: "url", description: "The project detail page renders this repo's README as its body content." }),
    defineField({ name: "liveUrl", type: "url", description: "Link to the live/deployed version of the project." }),
    defineField({ name: "thumbnail", type: "image", options: { hotspot: true }, description: "Cover image shown on project cards.", fields: [{ name: "alt", type: "string" }] }),
  ],
  preview: { select: { title: "title", subtitle: "summary", media: "thumbnail" } },
});
