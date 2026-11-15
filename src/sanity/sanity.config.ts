import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { projectSchema } from "./schemas/project";
import { technologySchema } from "./schemas/technology";
import { skillSchema, experienceSchema, aboutSchema, heroConfigSchema } from "./schemas/index";
import { projectId, dataset, apiVersion } from "./lib/client";

export default defineConfig({
  basePath: "/admin",
  projectId,
  dataset,
  apiVersion,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [projectSchema, technologySchema, skillSchema, experienceSchema, aboutSchema, heroConfigSchema],
  },
});
