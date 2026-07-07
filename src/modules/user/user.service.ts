import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

 const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};


const updateUserStatusInDB = async (
  userId: string,
  status: UserStatus
) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const userService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
};