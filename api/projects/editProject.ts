import mongoose from "mongoose";
import { IProject, Project } from "../../models/project";

interface UpdateProjectBody extends Partial<IProject> {}

export const updateProject = async (req, res) => {
  const projectData: UpdateProjectBody = req.body;
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
  Object.keys(projectData).forEach(
    (field) => (dbProject[field] = projectData[field])
  );
  try {
    const savedProject = await dbProject.save();
    return res.status(200).json({ project: savedProject });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Project has been deleted" });
    }
    return res.status(500).json({ msg: "Project couldn't be saved" });
  }
};
