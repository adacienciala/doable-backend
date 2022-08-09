import mongoose from "mongoose";

export interface ITask {
  taskId: string;
  title: string;
  description: string;
  date: Date;
  xp: number;
  owner: string[];
  projectId: string;
  isChallenge: boolean;
  isDone: boolean;
  repeat: string;
}

const TaskSchema = new mongoose.Schema<ITask>({
  taskId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  date: Date,
  xp: Number,
  owner: [String],
  projectId: String,
  isChallenge: Boolean,
  isDone: { type: Boolean, required: true },
  repeat: String,
});

export const Task = mongoose.model<ITask>("Task", TaskSchema, "tasks");
