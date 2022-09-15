import { TaskData } from ".";
import { ITask, Task } from "../../models/task";
import { User } from "../../models/user";
import { generateUniqueTaskId } from "../../utils/tasks";
import {
  updateProjectCurrentStatistics,
  updateProjectHistoryStatistics,
} from "../projects/operations/updateProjectStatistics";

interface AddTaskBody extends TaskData {}

export const addTask = async (req, res) => {
  const taskData: AddTaskBody = req.body;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;

  try {
    await updateProjectHistoryStatistics(
      userDoableId,
      userPartyId,
      1,
      taskData.projectId
    );
    if (!taskData.isDone) {
      await updateProjectCurrentStatistics(
        userDoableId,
        userPartyId,
        1,
        taskData.projectId
      );
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
    difficulty: taskData.difficulty ?? "easy",
    owner: [userDoableId],
    projectId: taskData.projectId,
    isChallenge: taskData.isChallenge === true,
    isDone: taskData.isDone === true,
    repeat: taskData.repeat,
  };
  const dbTask = await Task.create<ITask>(newTask);

  const { acknowledged: acknowledgedOwners } = await User.updateMany(
    { partyId: userPartyId },
    { $inc: { "statistics.tasks.current": 1 } }
  );
  if (!acknowledgedOwners) {
    throw new Error("Owners statistics not updated");
  }

  const { acknowledged } = await User.updateOne(
    { doableId: userDoableId },
    { $inc: { "statistics.tasks.created": 1 } }
  );
  if (!acknowledged) {
    return res.status(404).json({ msg: "User statistics not updated" });
  }

  return res.status(201).json(dbTask);
};
