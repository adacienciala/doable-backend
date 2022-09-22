import { v4 as uuidv4 } from "uuid";
import { Message } from "../models/message";

export async function generateUniqueMessageId() {
  while (true) {
    const id = uuidv4();
    const message = await Message.findOne({ messageId: id });
    if (!message) {
      return id;
    }
  }
}
