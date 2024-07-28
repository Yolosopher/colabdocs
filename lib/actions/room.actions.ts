"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { liveblocks } from "../liveblocks";
import { getAccessType } from "../utils";
import { redirect } from "next/navigation";
import { findClerkUser, getClerkUsers } from "./user.actions";
import { RoomData } from "@liveblocks/node";

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
    console.log;
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
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

    // check if user has access
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    if (!hasAccess) {
      throw new Error("You don't have access to this document");
    }

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

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams): Promise<{ error: string | null }> => {
  try {
    // check if user exists
    const foundUser = await findClerkUser(email);
    if (!foundUser) {
      throw new Error("User not found");
    }
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    if (updatedRoom) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`/documents/${roomId}`);
    return {
      error: null,
    };
  } catch (error) {
    return {
      error: `Error happened while updating a room access: ${error}`,
    };
  }
};

export const removeCollaborator = async ({
  email,
  roomId,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error("You can't remove the owner of the document");
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });

    revalidatePath(`/documents/${roomId}`);
    return updatedRoom;
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
};
