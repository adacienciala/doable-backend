const rewardsData = [
  {
    rewardId: "1",
    title: "Finish 10 tasks",
    description:
      "Amet proident do Lorem tempor labore quis excepteur commodo commodo consequat velit.",
    cover: "randomA",
    progress: 60,
    rarity: "bronze",
    popularity: 17968,
  },
  {
    rewardId: "2",
    title: "Join a party",
    description:
      "Non nostrud et laboris aute do sunt cupidatat reprehenderit velit.",
    cover: "randomB",
    progress: 100,
    rarity: "bronze",
    popularity: 1792,
  },
  {
    rewardId: "3",
    title: "Keep a 10 day streak",
    description: "Culpa est consequat amet excepteur sit est.",
    cover: "randomC",
    progress: 20,
    rarity: "silver",
    popularity: 179,
  },
  {
    rewardId: "4",
    title: "Get 1st place in your party",
    description: "Ex cupidatat non cillum commodo do enim sunt duis.",
    cover: "randomD",
    progress: 0,
    rarity: "gold",
    popularity: 17,
  },
  {
    rewardId: "5",
    title: "Finish 100 tasks",
    description:
      "Amet proident do Lorem tempor labore quis excepteur commodo commodo consequat velit.",
    cover: "randomA",
    progress: 60,
    rarity: "silver",
    popularity: 17968,
  },
  {
    rewardId: "6",
    title: "Change a party",
    description:
      "Non nostrud et laboris aute do sunt cupidatat reprehenderit velit.",
    cover: "randomB",
    progress: 100,
    rarity: "silver",
    popularity: 1792,
  },
  {
    rewardId: "7",
    title: "Keep a 100 day streak",
    description: "Culpa est consequat amet excepteur sit est.",
    cover: "randomC",
    progress: 20,
    rarity: "gold",
    popularity: 179,
  },
  {
    rewardId: "8",
    title: "Get 1st place in all parties",
    description: "Ex cupidatat non cillum commodo do enim sunt duis.",
    cover: "randomD",
    progress: 0,
    rarity: "gold",
    popularity: 17,
  },
];

export const getRewards = async (req, res) => {
  if (!rewardsData) {
    return res.status(404).json({
      msg: "could not find rewards",
    });
  }

  return res.status(200).json(rewardsData);
};
