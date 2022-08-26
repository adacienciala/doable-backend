import { Project } from "../../models/project";

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
  return res.sendStatus(204);
};
