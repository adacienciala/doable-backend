import mongoose from "mongoose";
import { TaskData } from ".";
import { Project } from "../../models/project";
import { Task } from "../../models/task";
import {
  checkTaskChangedProject,
  updateProjectStatistics,
} from "../projects/operations/updateProjectStatistics";
import { handleTaskFinished, isTaskFinished } from "./operations/finishTask";

interface UpdateTaskBody extends Partial<TaskData> {}

export const updateTask = async (req, res) => {
  const taskData: UpdateTaskBody = req.body;
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const projects = await Project.find({
    party: userPartyId,
  })
    .select({ projectId: 1 })
    .lean();
  const projectsIds = projects.map((p) => p.projectId);
  const dbTask = await Task.findOne({
    taskId,
    $or: [{ owner: userDoableId }, { projectId: projectsIds }],
  });
  if (!dbTask) {
    return res.status(404).json({ msg: "Task not found" });
  }
  if (dbTask.isDone) {
    return res.status(400).json({ msg: "Cannot edit finished task" });
  }
  const taskFinished = isTaskFinished(dbTask, taskData.isDone);
  const { taskChangedProject, oldProjectId, newProjectId } =
    checkTaskChangedProject(dbTask, taskData.projectId);
  Object.keys(taskData).forEach((field) => (dbTask[field] = taskData[field]));

  try {
    const savedTask = await dbTask.save();
    if (taskFinished) {
      await handleTaskFinished(dbTask, userDoableId, req.app.get("ranks"));
    }
    await updateProjectStatistics(
      userDoableId,
      userPartyId,
      { taskFinished, projectId: dbTask.projectId },
      { taskChangedProject, oldProjectId, newProjectId }
    );
    return res.status(200).json({ task: savedTask, userUpdated: taskFinished });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Task has been deleted" });
    }
    if (
      [
        "Cannot find user",
        "Cannot not update project",
        "Cannot find project",
        "Cannot find task's project",
      ].includes(e.message)
    ) {
      return res.status(400).json({ msg: e.message });
    }
    return res.status(500).json({ msg: "Task couldn't be saved" });
  }
};
