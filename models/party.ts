import mongoose from "mongoose";

export interface IParty {
  name: string;
}

const PartySchema = new mongoose.Schema<IParty>({
  name: { type: String, required: true },
});

export const Party = mongoose.model<IParty>("Party", PartySchema, "parties");
