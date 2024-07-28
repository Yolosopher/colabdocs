import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

type DocumentProps = {
  // unique id
  params: {
    id: string;
  };
};

export async function generateMetadata(
  { params: { id } }: DocumentProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  // fetch data
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });
  if (!room) redirect("/");

  return {
    title: (room.metadata as RoomMetadata).title,
    description: "Collaborative document",
  };
}

const Document = async ({ params: { id } }: DocumentProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });
  if (!users) redirect("/");

  const usersData = users.map((user) => ({
    ...user,
    // @ts-ignore
    userType: room.usersAccesses[user?.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));

  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
    // @ts-ignore
  ]?.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        currentUserType={currentUserType}
        roomMetadata={room.metadata as RoomMetadata}
        users={usersData}
      />
    </main>
  );
};

export default Document;
