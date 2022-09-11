import { HydratedDocument } from "mongoose";
import { Project } from "../../../models/project";
import { ITask } from "../../../models/task";

export async function updateProjectStatistics(
  userDoableId: string,
  userPartyId: string,
  { taskFinished, projectId },
  { taskChangedProject, oldProjectId, newProjectId }
) {
  if (taskChangedProject) {
    await updateProjectHistoryStatistics(
      userDoableId,
      userPartyId,
      -1,
      oldProjectId
    );
    await updateProjectHistoryStatistics(
      userDoableId,
      userPartyId,
      1,
      newProjectId
    );
    await updateProjectCurrentStatistics(
      userDoableId,
      userPartyId,
      -1,
      oldProjectId
    );
    if (!taskFinished) {
      await updateProjectCurrentStatistics(
        userDoableId,
        userPartyId,
        1,
        newProjectId
      );
    }
  } else {
    if (taskFinished) {
      await updateProjectCurrentStatistics(
        userDoableId,
        userPartyId,
        -1,
        projectId
      );
    }
  }
}

export async function updateProjectHistoryStatistics(
  userDoableId: string,
  userPartyId: string,
  amount: number,
  projectId?: string
) {
  if (!projectId) return;
  const { acknowledged, matchedCount, modifiedCount } = await Project.updateOne(
    {
      $or: [{ owner: userDoableId }, { party: userPartyId }],
      projectId: projectId,
    },
    { $inc: { historyTasksNumber: amount } }
  );
  if (!acknowledged) {
    throw new Error("Cannot update project");
  }
  if (!matchedCount && !modifiedCount) {
    throw new Error("Cannot find project");
  }
}

export async function updateProjectCurrentStatistics(
  userDoableId: string,
  userPartyId: string,
  amount: number,
  projectId?: string
) {
  if (!projectId) return;
  const { acknowledged, matchedCount, modifiedCount } = await Project.updateOne(
    {
      $or: [{ owner: userDoableId }, { party: userPartyId }],
      projectId: projectId,
    },
    { $inc: { currentTasksNumber: amount } }
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
