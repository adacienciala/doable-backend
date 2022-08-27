import mongoose from "mongoose";
import { IParty, Party } from "../../models/party";

interface UpdatePartyBody extends Partial<IParty> {}

export const updateParty = async (req, res) => {
  const partyData: UpdatePartyBody = req.body;
  const partyId = req.params.partyId;
  const userDoableId = req.userDoableId;
  const dbParty = await Party.findOne({
    partyId,
    owner: userDoableId,
  });
  if (!dbParty) {
    return res.status(404).json({ msg: "Party not found" });
  }
  Object.keys(partyData).forEach(
    (field) => (dbParty[field] = partyData[field])
  );
  // TODO: handle members linkage
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
