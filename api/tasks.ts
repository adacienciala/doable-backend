import { addDays, startOfWeek } from "date-fns";

const firstDayOfWeek = startOfWeek(Date.now(), { weekStartsOn: 1 });

export const getTasks = async (req, res) => {
  // if (!req.body.token) {
  //   return res.status(403).json({
  //     msg: "missing token", // TODO: implement auth middleware on express app
  //   });
  // }

  return res.json([
    {
      id: 1,
      title: "TitleMonday",
      description: "Some description 1",
      date: addDays(firstDayOfWeek, 0),
    },
    {
      id: 2,
      title: "TitleWednesday",
      description: "Some description 2",
      date: addDays(firstDayOfWeek, 2),
    },
    {
      id: 3,
      title: "TitleSaturday",
      description: "Some description 3",
      date: addDays(firstDayOfWeek, 5),
    },
    {
      id: 4,
      title: "TitleToday",
      description: "Some description 1",
      date: new Date(),
    },
    {
      id: 5,
      title: "TitleToday",
      description: "Some description 2",
      date: new Date(),
    },
  ]);
};
