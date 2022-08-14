import { Task } from "../../models/task";

export const getSingleTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const dbTask = await Task.findOne({
    taskId,
    owner: userDoableId,
  });
  if (!dbTask) {
    return res.status(404).json({ msg: "Task not found" });
  }
  return res.status(200).json(dbTask);
};
