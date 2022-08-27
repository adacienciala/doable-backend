import { Party } from "../../models/party";

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

  // TODO: delete linkage from members

  return res.sendStatus(204);
};
