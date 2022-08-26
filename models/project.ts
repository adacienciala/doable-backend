import mongoose from "mongoose";

export interface IProject {
  projectId: string;
  name: string;
  cover: IProjectCover;
  owner: string[];
  historyTasksNumber: number;
}

export interface IProjectCover {
  custom: boolean;
  src: string;
}

const ProjectCoverSchema = new mongoose.Schema<IProjectCover>({
  custom: { type: Boolean, required: true },
  src: {
    type: String,
    required: function (this: IProjectCover) {
      return !this.custom;
    },
  },
});

const ProjectSchema = new mongoose.Schema<IProject>({
  projectId: { type: String, required: true },
  name: { type: String, required: true },
  cover: ProjectCoverSchema,
  owner: [String],
  historyTasksNumber: Number,
});

export const Project = mongoose.model<IProject>(
  "Project",
  ProjectSchema,
  "projects"
);
