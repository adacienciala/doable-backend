import mongoose from "mongoose";

export interface IParty {
  partyId: string;
  name: string;
  members: string[];
}

const PartySchema = new mongoose.Schema<IParty>({
  partyId: { type: String, required: true },
  name: { type: String, required: true },
  members: [String],
});

export const Party = mongoose.model<IParty>("Party", PartySchema, "parties");
