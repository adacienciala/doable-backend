import { Party } from "../../models/party";

export const getSingleParty = async (req, res) => {
  const userId = req.params.userId;
  const dbParty = await Party.findOne({
    members: userId,
  });
  if (!dbParty) {
    return res.status(404).json({ msg: "User not found" });
  }
  return res.status(200).json(dbParty);
};
