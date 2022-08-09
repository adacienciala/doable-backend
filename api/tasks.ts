import { ITask, Task } from "../models/task";
import { generateUniqueTaskId } from "../utils/tasks";

export const getTasks = async (req, res) => {
  const userId = req.userId;
  const tasks = await Task.find({ owner: { $in: [userId] } });
  if (!tasks) {
    return res.status(500).json({
      msg: "could not find tasks",
    });
  }

  return res.json(tasks);
};

interface AddTaskBody {
  taskData: ITask;
}

export const addTask = async (req, res) => {
  const { taskData }: AddTaskBody = req.body;
  const userId = req.userId;

  const newTask = {
    taskId: await generateUniqueTaskId(),
    title: taskData.title,
    description: taskData.description,
    date: taskData.date,
    xp: taskData.xp ?? 5,
    owner: [userId],
    projectId: taskData.projectId,
    isChallenge: taskData.isChallenge,
    isDone: taskData.isDone,
    repeat: taskData.repeat,
  };
  const dbTask = await Task.create<ITask>(newTask);

  return res.json(dbTask);
};
