import { TaskData } from ".";
import { ITask, Task } from "../../models/task";
import { generateUniqueTaskId } from "../../utils/tasks";
import {
  updateProjectCurrentStatistics,
  updateProjectHistoryStatistics,
} from "../projects/operations/updateProjectStatistics";

interface AddTaskBody extends TaskData {}

export const addTask = async (req, res) => {
  const taskData: AddTaskBody = req.body;
  const userDoableId = req.userDoableId;

  try {
    await updateProjectHistoryStatistics(1, taskData.projectId);
    if (!taskData.isDone) {
      await updateProjectCurrentStatistics(1, taskData.projectId);
    }
  } catch (e) {
    if (e.message === "Cannot not update project") {
      return res.status(400).json({ msg: e.message });
    }
    if (e.message === "Cannot find project") {
      return res.status(400).json({ msg: e.message });
    }
    return res.status(500).json({ msg: "Task couldn't be linked to project" });
  }

  const newTask = {
    taskId: await generateUniqueTaskId(),
    title: taskData.title,
    description: taskData.description,
    date: taskData.date,
    xp: taskData.xp ?? 5,
    owner: [userDoableId],
    projectId: taskData.projectId,
    isChallenge: taskData.isChallenge === true,
    isDone: taskData.isDone === true,
    repeat: taskData.repeat,
  };
  const dbTask = await Task.create<ITask>(newTask);

  return res.status(201).json(dbTask);
};
