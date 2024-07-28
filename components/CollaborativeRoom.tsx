"use client";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import Header from "./Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Editor } from "./editor/Editor";
import ActiveCollaborators from "./ActiveCollaborators";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import Loader from "./Loader";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  currentUserType,
  users,
}: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [documentTitle, setDocumentTitle] = useState<string>(
    roomMetadata.title
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const requestForUpdateTitleHandler = useCallback(async () => {
    if (documentTitle === roomMetadata.title) {
      setEditing(false);
      return;
    }
    try {
      setLoading(true);
      if (documentTitle !== roomMetadata.title) {
        const updatedDocument = await updateDocument(roomId, documentTitle);
        if (updatedDocument) {
          setEditing(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentTitle, roomId, roomMetadata.title]);
  const updateTitleHandler = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await requestForUpdateTitleHandler();
    }
  };

  useEffect(() => {
    const handleClickOutside = async (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        await requestForUpdateTitleHandler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [documentTitle, requestForUpdateTitleHandler, roomId]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div
              ref={containerRef}
              className="flex w-fit items-center justify-center gap-2"
            >
              {editing && !loading ? (
                <Input
                  type="text"
                  value={documentTitle}
                  ref={inputRef}
                  placeholder="Enter title"
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className="document-title-input"
                />
              ) : (
                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              )}

              {currentUserType === "editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)}
                  className="cursor-pointer"
                />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View only</p>
              )}
              {loading && <p className="text-sm text-gray-400">Saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users!}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType!}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor
            roomId={roomId}
            currentUserType={currentUserType!}
            roomMetadata={roomMetadata}
          />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
