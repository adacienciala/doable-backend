import mongoose from "mongoose";
import { IParty, Party } from "../../models/party";
import { Project } from "../../models/project";
import { Task } from "../../models/task";
import { User } from "../../models/user";
import { handleLinkingMembers } from "./operations/linkingMembers";

interface UpdatePartyBody extends Partial<IParty> {}

export const updateParty = async (req, res) => {
  const partyData: UpdatePartyBody = req.body;
  const partyId = req.params.partyId;
  const dbParty = await Party.findOne({
    partyId,
  });
  if (!dbParty) {
    return res.status(404).json({ msg: "Party not found" });
  }

  if (partyData.members) {
    const usersJoining = partyData.members.filter(
      (oldMember) => !dbParty.members.includes(oldMember)
    );

    const usersLeaving = dbParty.members.filter(
      (oldMember) => !partyData.members!.includes(oldMember)
    );

    // update statistics for users

    const { acknowledged: acknowledgedJoining } = await User.updateMany(
      {
        doableId: usersJoining,
      },
      {
        $inc: { "statistics.tasks.current": await getPartyTasksCount(partyId) },
        "statistics.party.xp": 0,
        "statistics.party.level": 1,
      }
    );
    if (!acknowledgedJoining) {
      return res.status(404).json({ msg: "Owners statistics not updated" });
    }

    const { acknowledged: acknowledgedLeaving } = await User.updateMany(
      {
        doableId: usersLeaving,
      },
      {
        $inc: {
          "statistics.tasks.current": (await getPartyTasksCount(partyId)) * -1,
        },
        "statistics.party.xp": 0,
        "statistics.party.level": 0,
      }
    );
    if (!acknowledgedLeaving) {
      return res.status(404).json({ msg: "Owners statistics not updated" });
    }

    try {
      await handleLinkingMembers(partyId, dbParty.members, partyData.members);
    } catch (e) {
      if (e.message === "Unknown users in members array") {
        return res.status(400).json({ msg: e.message });
      }
      return res
        .status(500)
        .json({ msg: "Party couldn't be saved. " + e.message });
    }
  }

  Object.keys(partyData).forEach(
    (field) => (dbParty[field] = partyData[field])
  );

  try {
    const savedParty = await dbParty.save();
    return res.status(200).json({ party: savedParty });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Party has been deleted" });
    }
    return res.status(500).json({ msg: "Party couldn't be saved" });
  }
};

async function getPartyTasksCount(partyId: string) {
  const projects = await Project.find({
    party: partyId,
  })
    .select({ projectId: 1 })
    .lean();
  const projectsIds = projects.map((p) => p.projectId);
  const count = await Task.countDocuments({
    projectId: projectsIds,
    isDone: false,
  });
  return count;
}
