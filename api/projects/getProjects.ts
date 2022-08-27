import { Project } from "../../models/project";

export const getProjects = async (req, res) => {
  const userDoableId = req.userDoableId;
  const projects = await Project.find({ owner: userDoableId });
  if (!projects) {
    return res.status(404).json({
      msg: "could not find projects",
    });
  }

  return res.status(200).json(projects);
};
