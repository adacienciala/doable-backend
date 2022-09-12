import mongoose from "mongoose";
import { IParty, Party } from "../../models/party";
import { User } from "../../models/user";
import { generateUniquePartyId } from "../../utils/parties";

interface AddPartyBody extends IParty {}

export const addParty = async (req, res) => {
  const partyData: AddPartyBody = req.body;
  const userDoableId = req.userDoableId;

  const members = [userDoableId, ...(partyData.members ?? [])];

  const users = await User.find({ doableId: members });
  if (users.length !== members.length) {
    return res.status(400).json({ msg: "Unknown users in members array" });
  }

  const newParty = {
    partyId: await generateUniquePartyId(),
    name: partyData.name,
    description: partyData.description,
    members: members,
    cover: partyData.cover,
  };
  const dbParty = await Party.create<IParty>(newParty);

  try {
    for (const user of users) {
      user.partyId = dbParty.partyId;
      user.statistics.party.xp = 0;
      user.statistics.party.level = 1;
      await user.save();
    }
    return res.status(201).json(dbParty);
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Not all users have been updated" });
    }
    return res.status(500).json({ msg: "Users couldn't be updated" });
  }
};
