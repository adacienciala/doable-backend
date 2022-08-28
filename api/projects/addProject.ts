import { IProject, Project } from "../../models/project";
import { generateUniqueProjectId } from "../../utils/projects";

interface AddProjectBody extends IProject {}

export const addProject = async (req, res) => {
  const projectData: AddProjectBody = req.body;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;

  const owners = [
    userDoableId,
    ,
    ...(projectData.owner ? [projectData.owner] : []),
  ].filter((i) => i);
  const parties = [...(projectData.party ?? [])].filter((i) => i);

  const newProject = {
    projectId: await generateUniqueProjectId(),
    name: projectData.name,
    owner: parties.length === 0 ? owners : [],
    cover: projectData.cover,
    party: parties,
    historyTasksNumber: 0,
    currentTasksNumber: 0,
  };
  const dbProject = await Project.create<IProject>(newProject);

  return res.status(201).json(dbProject);
};
