"use client";

import Loader from "@/components/Loader";
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import {
  LiveblocksProvider,
  ClientSideSuspense,
  useSelf,
} from "@liveblocks/react/suspense";

type ProviderProps = {
  children: React.ReactNode;
};

const Provider = ({ children }: ProviderProps) => {
  const { user: clerkUser } = useUser();
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const result = await getClerkUsers({ userIds });
        return result?.map((user) => ({ ...user, color: "" }));
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const roomUsers = (await getDocumentUsers({
          roomId,
          text,
          currentUser: clerkUser?.emailAddresses[0].emailAddress!,
        }))!;
        return roomUsers;
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>{children}</ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default Provider;
