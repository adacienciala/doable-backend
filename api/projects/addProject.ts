import { IProject, Project } from "../../models/project";
import { generateUniqueProjectId } from "../../utils/projects";

interface AddProjectBody extends IProject {}

export const addProject = async (req, res) => {
  const projectData: AddProjectBody = req.body;
  const userDoableId = req.userDoableId;

  const newProject = {
    projectId: await generateUniqueProjectId(),
    name: projectData.name,
    owner: [userDoableId, ...(projectData.owner ? projectData.owner : [])],
    cover: projectData.cover,
    historyTasksNumber: 0,
  };
  const dbProject = await Project.create<IProject>(newProject);

  return res.status(201).json(dbProject);
};
