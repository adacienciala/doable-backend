import { ITask, Task } from "../../models/task";
import { generateUniqueTaskId } from "../../utils/tasks";

interface AddTaskBody {
  title: string;
  description: string;
  date: Date;
  xp: number;
  projectId: string;
  isChallenge: boolean;
  isDone: boolean;
  repeat: string;
}

export const addTask = async (req, res) => {
  const taskData: AddTaskBody = req.body;
  const userId = req.userId;

  const newTask = {
    taskId: await generateUniqueTaskId(),
    title: taskData.title,
    description: taskData.description,
    date: taskData.date,
    xp: taskData.xp ?? 5,
    owner: [userId],
    projectId: taskData.projectId,
    isChallenge: taskData.isChallenge === true,
    isDone: taskData.isDone === true,
    repeat: taskData.repeat,
  };
  const dbTask = await Task.create<ITask>(newTask);

  return res.json(dbTask);
};
