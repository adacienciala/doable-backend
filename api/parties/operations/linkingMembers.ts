import { User } from "../../../models/user";

// TODO: check when party no members or to no members
export async function handleLinkingMembers(
  partyId: string,
  oldMembers: string[] = [],
  newMembers: string[] = []
) {
  const newUsers = await User.find({ doableId: { $in: newMembers } });
  if (newUsers.length !== newMembers.length) {
    throw new Error("Unknown users in members array");
  }
  const usersToUnlink = oldMembers.filter(
    (oldMember) => !newMembers.includes(oldMember)
  );
  const usersToLink = newMembers.filter(
    (newMember) => !oldMembers.includes(newMember)
  );

  if (usersToUnlink.length > 0) {
    const { acknowledged: acknowledgedUnsubcribe } = await User.updateMany(
      { doableId: { $in: usersToUnlink } },
      {
        $set: {
          partyId: "",
        },
      }
    );
    if (!acknowledgedUnsubcribe) {
      throw new Error("Cannot unsubscribe members");
    }
  }

  if (usersToLink.length > 0) {
    const { acknowledged, matchedCount, modifiedCount } = await User.updateMany(
      { doableId: { $in: usersToLink } },
      {
        $set: {
          partyId: partyId,
        },
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
