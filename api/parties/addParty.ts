import { IParty, Party } from "../../models/party";
import { generateUniquePartyId } from "../../utils/parties";

interface AddPartyBody extends IParty {}

export const addParty = async (req, res) => {
  const partyData: AddPartyBody = req.body;
  const userDoableId = req.userDoableId;

  const newParty = {
    partyId: await generateUniquePartyId(),
    name: partyData.name,
    description: partyData.description,
    members: [userDoableId, ...(partyData.members ?? [])],
    cover: partyData.cover,
  };
  const dbParty = await Party.create<IParty>(newParty);

  // TODO: link members to party

  return res.status(201).json(dbParty);
};
