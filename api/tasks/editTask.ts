import mongoose from "mongoose";
import { TaskData } from ".";
import { Task } from "../../models/task";
import { handleTaskFinished, isTaskFinished } from "./operations/finishTask";

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
  if (dbTask.isDone) {
    return res.status(400).json({ msg: "Cannot edit finished task" });
  }
  const taskFinished = isTaskFinished(dbTask, taskData.isDone);
  Object.keys(taskData).forEach((field) => (dbTask[field] = taskData[field]));
  try {
    const savedTask = await dbTask.save();
    if (taskFinished) {
      await handleTaskFinished(dbTask, userDoableId, req.app.get("ranks"));
    }
    return res.status(200).json({ task: savedTask, userUpdated: taskFinished });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Task has been deleted" });
    }
    if (e.message === "Cannot find user") {
      return res.status(400).json({ msg: e.message });
    }
    return res.status(500).json({ msg: "Task couldn't be saved" });
  }
};
