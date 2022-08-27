import { v4 as uuidv4 } from "uuid";
import { Party } from "../models/party";

export async function generateUniquePartyId() {
  while (true) {
    const id = uuidv4();
    const party = await Party.findOne({ partyId: id });
    if (!party) {
      return id;
    }
  }
}
