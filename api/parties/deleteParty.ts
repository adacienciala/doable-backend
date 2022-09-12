import mongoose from "mongoose";
import { Party } from "../../models/party";
import { Project } from "../../models/project";
import { Task } from "../../models/task";
import { User } from "../../models/user";
import { handleLinkingMembers } from "./operations/linkingMembers";

export const deleteParty = async (req, res) => {
  const partyId = req.params.partyId;
  const userDoableId = req.userDoableId;
  const deletedParty = await Party.findOneAndDelete({
    partyId,
    members: userDoableId,
  });
  if (!deletedParty) {
    return res.status(404).json({ msg: "Party not found" });
  }

  // unlink / delete party's projects (with tasks)

  const projects = await Project.find({
    party: partyId,
  });
  try {
    for (const project of projects) {
      const filteredPartyIds = project.party.filter((id) => id !== partyId);
      if (filteredPartyIds.length + project.owner.length === 0) {
        const { acknowledged, deletedCount } = await Task.deleteMany({
          projectId: project.projectId,
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
            $or: [{ doableId: project.owner }, { partyId: project.party }],
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

        await project.delete();
      } else {
        project.party = filteredPartyIds;
        await project.save();
      }
    }
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res
        .status(400)
        .json({ msg: "Not all projects have been updated" });
    }
    return res.status(500).json({ msg: "Projects couldn't be updated" });
  }

  if (deletedParty.members) {
    try {
      await handleLinkingMembers(partyId, deletedParty.members, undefined);
    } catch (e) {
      return res.status(500).json({ msg: "Members couldn't be unlinked." });
    }
  }

  return res.sendStatus(204);
};
