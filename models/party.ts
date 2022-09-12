import mongoose from "mongoose";

export interface IParty {
  partyId: string;
  name: string;
  description: string;
  cover: string;
  members: string[];
}

const PartySchema = new mongoose.Schema<IParty>(
  {
    partyId: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    cover: String,
    members: [String],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

PartySchema.virtual("membersDetails", {
  ref: "User",
  localField: "members",
  foreignField: "doableId",
});

export const Party = mongoose.model<IParty>("Party", PartySchema, "parties");
