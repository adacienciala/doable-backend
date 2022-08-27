import { Party } from "../../models/party";

export const getSingleParty = async (req, res) => {
  const partyId = req.params.partyId;
  const userDoableId = req.userDoableId;
  const dbParty = await Party.findOne({
    members: userDoableId,
    partyId: partyId,
  });
  if (!dbParty) {
    return res.status(404).json({ msg: "User not found" });
  }
  return res.status(200).json(dbParty);
};
