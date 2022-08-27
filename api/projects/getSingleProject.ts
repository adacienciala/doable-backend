import { Project } from "../../models/project";

export const getSingleProject = async (req, res) => {
  const projectId = req.params.projectId;
  const userDoableId = req.userDoableId;
  const dbProject = await Project.findOne({
    projectId,
    owner: userDoableId,
  });
  if (!dbProject) {
    return res.status(404).json({ msg: "Project not found" });
  }
  return res.status(200).json(dbProject);
};
