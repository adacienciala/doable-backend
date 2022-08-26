import { v4 as uuidv4 } from "uuid";
import { Project } from "../models/project";

export async function generateUniqueProjectId() {
  while (true) {
    const id = uuidv4();
    const project = await Project.findOne({ projectId: id });
    if (!project) {
      return id;
    }
  }
}
