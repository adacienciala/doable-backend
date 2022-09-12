import { User } from "../../../models/user";

export async function handleLinkingMembers(
  partyId: string,
  oldMembers: string[] = [],
  newMembers: string[] = []
) {
  const newUsers = await User.find({ doableId: { $in: newMembers } });
  if (newUsers.length !== newMembers.length) {
    throw new Error("Unknown users in members array");
  }
  const usersLeaving = oldMembers.filter(
    (oldMember) => !newMembers.includes(oldMember)
  );
  const usersJoining = newMembers.filter(
    (newMember) => !oldMembers.includes(newMember)
  );

  if (usersLeaving.length > 0) {
    const { acknowledged: acknowledgedUnsubcribe } = await User.updateMany(
      { doableId: { $in: usersLeaving } },
      {
        "statistics.party.xp": 0,
        "statistics.party.level": 0,
        partyId: "",
      }
    );
    if (!acknowledgedUnsubcribe) {
      throw new Error("Cannot unsubscribe members");
    }
  }

  if (usersJoining.length > 0) {
    const { acknowledged, matchedCount, modifiedCount } = await User.updateMany(
      { doableId: { $in: usersJoining } },
      {
        "statistics.party.xp": 0,
        "statistics.party.level": 1,
        partyId: partyId,
      }
    );
    if (!acknowledged) {
      throw new Error("Cannot subscribe members");
    }
    if (!matchedCount && !modifiedCount) {
      throw new Error("Cannot subscribe all members");
    }
  }
}
