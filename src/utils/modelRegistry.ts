import Post from "../models/Post";
import Project from "../models/Project";
import { Model as MongooseModel } from "mongoose";

/**
 * Central registry for polymorphic parent models.
 */
export const modelRegistry: Record<
  string,
  { model: MongooseModel<any>; name: "Post" | "Project" }
> = {
  posts: { model: Post, name: "Post" },
  projects: { model: Project, name: "Project" },
};

/**
 * Resolves the model entry for a given parentType.
 * @param parentType - The type from req.params (e.g., 'posts', 'projects').
 * @returns The model and name entry.
 * @throws Error if the parentType is invalid.
 */
export const getModelEntry = (parentType: string) => {
  const entry = modelRegistry[parentType];
  if (!entry) {
    throw new Error(`Invalid parent type: ${parentType}`);
  }
  return entry;
};
