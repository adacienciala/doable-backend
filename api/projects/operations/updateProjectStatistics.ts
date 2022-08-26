import { HydratedDocument } from "mongoose";
import { Project } from "../../../models/project";
import { ITask } from "../../../models/task";

export async function updateProjectStatistics(
  amount: number,
  projectId?: string
) {
  if (!projectId) return;
  const { acknowledged, matchedCount, modifiedCount } = await Project.updateOne(
    { projectId: projectId },
    { $inc: { historyTasksNumber: amount } }
  );
  if (!acknowledged) {
    throw new Error("Cannot not update project");
  }
  if (!matchedCount && !modifiedCount) {
    throw new Error("Cannot find project");
  }
}

export function checkTaskChangedProject(
  task: HydratedDocument<ITask>,
  projectId?: string
) {
  const taskChangedProject =
    projectId !== undefined && task.projectId !== projectId;
  const oldProjectId = task.projectId;
  const newProjectId = projectId;

  return { taskChangedProject, oldProjectId, newProjectId };
}
