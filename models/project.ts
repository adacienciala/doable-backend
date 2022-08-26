import mongoose from "mongoose";

export interface IProject {
  projectId: string;
  name: string;
  cover: string;
  owner: string[];
  historyTasksNumber: number;
  currentTasksNumber: number;
}

const ProjectSchema = new mongoose.Schema<IProject>({
  projectId: { type: String, required: true },
  name: { type: String, required: true },
  cover: String,
  owner: [String],
  historyTasksNumber: Number,
  currentTasksNumber: Number,
});

export const Project = mongoose.model<IProject>(
  "Project",
  ProjectSchema,
  "projects"
);
