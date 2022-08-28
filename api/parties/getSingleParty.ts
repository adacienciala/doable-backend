import { Party } from "../../models/party";
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
  const members = await User.find({ doableId: dbParty.members });

  const mappedParty: any = dbParty;
  mappedParty.members = dbParty.members.map((memberId) => {
    const member = members.find((m) => m.doableId === memberId);
    const newMemberData = {
      name: member?.name,
      surname: member?.surname,
      statistics: member?.statistics,
      settings: member?.settings,
    };
    return newMemberData;
  });

  return res.status(200).json(mappedParty);
};
