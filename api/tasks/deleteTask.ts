import { Project } from "../../models/project";
import { Task } from "../../models/task";
import { User } from "../../models/user";
import {
  updateProjectCurrentStatistics,
  updateProjectHistoryStatistics,
} from "../projects/operations/updateProjectStatistics";

export const deleteTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;

  // find projects that belong to user's party
  const projects = await Project.find({
    $or: [{ owner: userDoableId }, { party: userPartyId }],
  })
    .select({ projectId: 1 })
    .lean();
  const projectIds = projects.map((p) => p.projectId);

  // delete user's / party's tasks
  const deletedTask = await Task.findOneAndDelete({
    taskId,
    $or: [{ owner: userDoableId }, { projectId: projectIds }],
  });
  if (!deletedTask) {
    return res.status(404).json({ msg: "Task not found" });
  }

  // update statistics for owners and user

  const { acknowledged: acknowledgedOwners } = await User.updateMany(
    { $or: [{ doableId: deletedTask.owner }, { partyId: userPartyId }] },
    { $inc: { "statistics.tasks.current": -1 } }
  );
  if (!acknowledgedOwners) {
    return res.status(404).json({ msg: "Owners statistics not updated" });
  }

  const { acknowledged } = await User.updateOne(
    { doableId: userDoableId },
    { $inc: { "statistics.tasks.deleted": 1 } }
  );
  if (!acknowledged) {
    return res.status(404).json({ msg: "User statistics not updated" });
  }

  // update other statistics

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
