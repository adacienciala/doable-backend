import { Party } from "../../models/party";
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

  if (deletedParty.members) {
    try {
      await handleLinkingMembers(partyId, deletedParty.members, undefined);
    } catch (e) {
      return res.status(500).json({ msg: "Members couldn't be unlinked." });
    }
  }

  return res.sendStatus(204);
};
