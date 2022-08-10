import { Task } from "../../models/task";

export const deleteTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userDoableId = req.userDoableId;
  const deletedTask = await Task.findOneAndDelete({
    taskId,
    owner: userDoableId,
  });
  if (!deletedTask) {
    return res.status(404).json({ msg: "Task not found" });
  }
  return res.sendStatus(204);
};
