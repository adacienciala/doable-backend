import { Party } from "../../models/party";

export const getParties = async (req, res) => {
  const parties = await Party.find({});
  if (!parties) {
    return res.status(404).json({
      msg: "could not find parties",
    });
  }

  return res.status(200).json(parties);
};
