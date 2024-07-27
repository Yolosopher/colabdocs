"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { liveblocks } from "../liveblocks";

export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: ["room:write"],
    });

    revalidatePath("/");

    return room;
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    // TODO: Bring back access control later
    // check if user has access
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    // if (!hasAccess) {
    //   throw new Error("You don't have access to this document");
    // }

    return room;
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
  }
};

export const getDocuments = async (email: string) => {
  try {
    const rooms = await liveblocks.getRooms({
      userId: email,
    });

    // TODO: Bring back access control later
    // check if user has access
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    // if (!hasAccess) {
    //   throw new Error("You don't have access to this document");
    // }

    return rooms;
  } catch (error) {
    console.log(`Error happened while getting rooms: ${error}`);
  }
};

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`/documents/${roomId}`);

    return updatedRoom;
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
};
