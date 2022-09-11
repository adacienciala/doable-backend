import { Task } from "../../models/task";
import {
  updateProjectCurrentStatistics,
  updateProjectHistoryStatistics,
} from "../projects/operations/updateProjectStatistics";

export const deleteTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const deletedTask = await Task.findOneAndDelete({
    taskId,
    owner: userDoableId,
  });
  if (!deletedTask) {
    return res.status(404).json({ msg: "Task not found" });
  }

  try {
    await updateProjectHistoryStatistics(
      userDoableId,
      userPartyId,
      -1,
      deletedTask.projectId
    );
    if (!deletedTask.isDone) {
      await updateProjectCurrentStatistics(
        userDoableId,
        userPartyId,
        -1,
        deletedTask.projectId
      );
    }
  } catch (e) {
    if (e.message === "Cannot not update project") {
      return res.status(400).json({ msg: e.message });
    }
    if (e.message === "Cannot find project") {
      return res.status(400).json({ msg: e.message });
    }
    return res
      .status(500)
      .json({ msg: "Task couldn't be unlinked from project" });
  }

  return res.sendStatus(204);
};
