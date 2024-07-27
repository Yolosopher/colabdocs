"use server";

import { clerkClient } from "@clerk/nextjs/server";

export const getClerkUsers = async (
  params: { userIds: string[] } | { emails: string[] }
) => {
  try {
    const payload =
      "emails" in params
        ? { emailAddress: params.emails }
        : { userId: params.userIds };

    const userIds = "emails" in params ? params.emails : params.userIds;

    const { data } = await clerkClient.users.getUserList(payload);

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));

    // const sortedUsers = userIds.map(
    //   (email) => users.find((user) => user.email === email)!
    // );

    return users;
  } catch (error) {
    console.log(`Error happened while fetching users: ${error}`);
  }
};
