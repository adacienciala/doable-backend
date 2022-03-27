import { Db, ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

export async function generateUniqueId(db: Db) {
  while (true) {
    const id = uuidv4();
    const user = await db.collection("accounts").findOne({ doableId: id });
    if (!user) {
      return id;
    }
  }
}

export async function updateToken(
  db: Db,
  userId: ObjectId,
  token: string,
  tokenSelector: string
): Promise<boolean> {
  const hashedToken = await bcrypt.hash(token, 10);
  const { acknowledged } = await db.collection("accounts").updateOne(
    { _id: userId },
    {
      $set: {
        token: hashedToken,
        tokenTimestamp: Date.now(),
        tokenSelector: tokenSelector,
      },
    }
  );
  return acknowledged;
}
