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
