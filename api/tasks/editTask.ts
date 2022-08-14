import mongoose from "mongoose";
import { TaskData } from ".";
import { Task } from "../../models/task";

interface UpdateTaskBody extends Partial<TaskData> {}

export const updateTask = async (req, res) => {
  const taskData: UpdateTaskBody = req.body;
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const dbTask = await Task.findOne({
    taskId,
    owner: userDoableId,
  });
  if (!dbTask) {
    return res.status(404).json({ msg: "Task not found" });
  }
  Object.keys(taskData).forEach((field) => (dbTask[field] = taskData[field]));
  try {
    const savedTask = await dbTask.save();
    return res.status(200).json(savedTask);
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Task has been deleted" });
    }
    return res.status(500).json({ msg: "Task couldn't be saved" });
  }
};
