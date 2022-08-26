import { Task } from "../../models/task";

export const getTasks = async (req, res) => {
  const userDoableId = req.userDoableId;
  const tasks = await Task.find({ owner: userDoableId, isDone: false });
  if (!tasks) {
    return res.status(404).json({
      msg: "could not find tasks",
    });
  }

  return res.status(200).json(tasks);
};
