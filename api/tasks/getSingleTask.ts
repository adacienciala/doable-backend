import { Project } from "../../models/project";
import { Task } from "../../models/task";

export const getSingleTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const projects = await Project.find({
    $or: [{ owner: userDoableId }, { party: userPartyId }],
  })
    .select({ projectId: 1 })
    .lean();
  const projectIds = projects.map((p) => p.projectId);
  const dbTask = await Task.findOne({
    taskId,
    $or: [{ owner: userDoableId }, { projectId: projectIds }],
  });
  if (!dbTask) {
    return res.status(404).json({ msg: "Task not found" });
  }
  return res.status(200).json(dbTask);
};
