import mongoose from "mongoose";
import { IParty, Party } from "../../models/party";
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
