import mongoose from "mongoose";

export interface IMessage {
  partyId: string;
  userId: string;
  message: string;
  date: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  partyId: { type: String, required: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

export const Message = mongoose.model<IMessage>(
  "Message",
  MessageSchema,
  "chat"
);
