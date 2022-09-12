export const getRanks = async (req, res) => {
  return res.status(200).json(req.app.get("ranks"));
};
