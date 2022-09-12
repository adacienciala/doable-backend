import { Project } from "../../models/project";
import { Task } from "../../models/task";
import { User } from "../../models/user";

export const deleteProject = async (req, res) => {
  const projectId = req.params.projectId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const deletedProject = await Project.findOneAndDelete({
    $and: [
      {
        $or: [{ owner: userDoableId }, { party: userPartyId }],
      },
      {
        projectId: projectId,
      },
    ],
  });
  if (!deletedProject) {
    return res.status(404).json({ msg: "Project not found" });
  }

  const { acknowledged, deletedCount } = await Task.deleteMany({
    projectId: projectId,
    isDone: false,
  });
  if (!acknowledged) {
    return res.status(400).json({
      msg: "could not delete tasks linked with project",
    });
  }

  // update statistics for owners and user

  const { acknowledged: acknowledgedOwners } = await User.updateMany(
    {
      $or: [
        { doableId: deletedProject.owner },
        { partyId: deletedProject.party },
      ],
    },
    { $inc: { "statistics.tasks.current": deletedCount * -1 } }
  );
  if (!acknowledgedOwners) {
    return res.status(404).json({ msg: "Owners statistics not updated" });
  }

  const { acknowledged: acknowledgedUser } = await User.updateOne(
    { doableId: userDoableId },
    { $inc: { "statistics.tasks.deleted": deletedCount } }
  );
  if (!acknowledgedUser) {
    return res.status(404).json({ msg: "User statistics not updated" });
  }

  return res.sendStatus(204);
};
