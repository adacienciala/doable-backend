import { v4 as uuidv4 } from "uuid";
import { Task } from "../models/task";

export async function generateUniqueTaskId() {
  while (true) {
    const id = uuidv4();
    const task = await Task.findOne({ taskId: id });
    if (!task) {
      return id;
    }
  }
}

export function mapTaskDifficultyToPoints(diffculty: string) {
  switch (diffculty) {
    case "easy":
      return 2;
    case "medium":
      return 4;
    case "hard":
      return 8;
    default:
      return 2;
  }
}
