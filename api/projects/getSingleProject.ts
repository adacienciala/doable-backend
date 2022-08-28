import { Project } from "../../models/project";

export const getSingleProject = async (req, res) => {
  const projectId = req.params.projectId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const dbProject = await Project.findOne({
    $and: [
      {
        $or: [{ owner: userDoableId }, { party: userPartyId }],
      },
      {
        projectId: projectId,
      },
    ],
  });
  if (!dbProject) {
    return res.status(404).json({ msg: "Project not found" });
  }
  return res.status(200).json(dbProject);
};
