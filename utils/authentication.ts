import { Db, ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import * as hash from "password-hash";

export async function generateUniqueId(db: Db) {
  while (true) {
    const id = uuidv4();
    const user = await db.collection("accounts").findOne({ doableId: id });
    if (!user) {
      return id;
    }
  }
}

export async function generateToken(
  db: Db,
  userId: ObjectId
): Promise<{ token: String; tokenSelector: String }> {
  let token = uuidv4();
  let tokenSelector = uuidv4();
  const hashedToken = hash.generate(token);
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
  if (!acknowledged) {
    token = null;
    tokenSelector = null;
  }
  return { token, tokenSelector };
}
