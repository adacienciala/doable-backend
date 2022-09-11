import { Project } from "../../models/project";
import { Task } from "../../models/task";

export const getTasks = async (req, res) => {
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const projects = await Project.find({
    $or: [{ owner: userDoableId }, { party: userPartyId }],
  })
    .select({ projectId: 1 })
    .lean();
  const projectIds = projects.map((p) => p.projectId);
  const tasks = await Task.find({
    $or: [{ owner: userDoableId }, { projectId: projectIds }],
    isDone: false,
  })
    .populate("projectDetails", ["name"])
    .lean();
  if (!tasks) {
    return res.status(404).json({
      msg: "could not find tasks",
    });
  }

  return res.status(200).json(tasks);
};
