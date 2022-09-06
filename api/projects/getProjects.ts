import { Party } from "../../models/party";
import { Project } from "../../models/project";
import { User } from "../../models/user";

export const getProjects = async (req, res) => {
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  const projects = await Project.find({
    $or: [{ owner: userDoableId }, { party: userPartyId }],
  }).lean();
  if (!projects) {
    return res.status(404).json({
      msg: "could not find projects",
    });
  }
  const mappedProjects: any = projects;
  const owners: string[] = [];
  const parties: string[] = [];
  mappedProjects.forEach((p) => {
    owners.push(...(p.owner ?? []));
    parties.push(...(p.party ?? []));
  });
  const foundOwners = await User.find({ doableId: owners })
    .select({ doableId: 1, name: 1, surname: 1, settings: 1 })
    .lean();
  const foundParties = await Party.find({ partyId: parties })
    .select({ partyId: 1, name: 1, cover: 1 })
    .lean();

  mappedProjects.forEach((project) => {
    const mappedOwners = (project.owner ?? []).map((ownerId) =>
      foundOwners.find((o) => o.doableId === ownerId)
    );
    const mappedParties = (project.party ?? []).map((partyId) =>
      foundParties.find((party) => party.partyId === partyId)
    );
    project.owner = mappedOwners;
    project.party = mappedParties;
  });

  return res.status(200).json(mappedProjects);
};
