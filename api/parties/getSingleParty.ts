import { Party } from "../../models/party";
import { Project } from "../../models/project";
import { User } from "../../models/user";

export const getSingleParty = async (req, res) => {
  const partyId = req.params.partyId;
  const userDoableId = req.userDoableId;
  const dbParty = await Party.findOne({
    members: userDoableId,
    partyId: partyId,
  }).lean();
  if (!dbParty) {
    return res.status(404).json({ msg: "Party not found" });
  }
  const members = await User.find({ doableId: dbParty.members }).lean();
  const projects = await Project.find({ party: dbParty.partyId }).lean();

  const mappedParty: any = dbParty;
  mappedParty.members = members.map((member) => ({
    doableId: member?.doableId,
    name: member?.name,
    surname: member?.surname,
    statistics: member?.statistics,
    settings: member?.settings,
  }));

  const mappedProjects: any = projects;
  const owners: string[] = [];
  const parties: string[] = [];
  mappedProjects.forEach((p) => {
    owners.push(...p.owner);
    parties.push(...p.party);
  });
  const foundOwners = await User.find({ doableId: owners })
    .select({ doableId: 1, name: 1, surname: 1, settings: 1 })
    .lean();
  const foundParties = await Party.find({ partyId: parties })
    .select({ partyId: 1, name: 1, cover: 1 })
    .lean();

  mappedProjects.forEach((project) => {
    const mappedOwners = project.owner.map((ownerId) =>
      foundOwners.find((o) => o.doableId === ownerId)
    );
    const mappedParties = project.party.map((partyId) =>
      foundParties.find((party) => party.partyId === partyId)
    );
    project.owner = mappedOwners;
    project.party = mappedParties;
  });

  mappedParty.quests = mappedProjects;

  return res.status(200).json(mappedParty);
};
