import mongoose from "mongoose";

export interface IMessage {
  messageId: string;
  partyId: string;
  userId: string;
  message: string;
  date: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  messageId: { type: String, required: true },
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
