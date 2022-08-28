import { Party } from "../../models/party";
import { Project } from "../../models/project";
import { User } from "../../models/user";

export const getSingleParty = async (req, res) => {
  const partyId = req.params.partyId;
  const userDoableId = req.userDoableId;
  const dbParty = await Party.findOne({
    members: userDoableId,
    partyId: partyId,
  }).lean();
  if (!dbParty) {
    return res.status(404).json({ msg: "Party not found" });
  }
  const members = await User.find({ doableId: dbParty.members }).lean();
  const projects = await Project.find({ party: dbParty.partyId }).lean();

  const mappedParty: any = dbParty;
  mappedParty.members = members.map((member) => ({
    name: member?.name,
    surname: member?.surname,
    statistics: member?.statistics,
    settings: member?.settings,
  }));
  mappedParty.quests = projects;

  return res.status(200).json(mappedParty);
};
