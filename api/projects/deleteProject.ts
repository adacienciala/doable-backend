import { Project } from "../../models/project";
import { Task } from "../../models/task";

export const deleteProject = async (req, res) => {
  const projectId = req.params.projectId;
  const userDoableId = req.userDoableId;
  const deletedProject = await Project.findOneAndDelete({
    projectId,
    owner: userDoableId,
  });
  if (!deletedProject) {
    return res.status(404).json({ msg: "Project not found" });
  }

  const { acknowledged } = await Task.deleteMany({ projectId: projectId });
  if (!acknowledged) {
    return res.status(400).json({
      msg: "could not delete tasks linked with project",
    });
  }

  return res.sendStatus(204);
};
