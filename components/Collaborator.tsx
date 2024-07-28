"use client";
import Image from "next/image";
import { useState } from "react";
import UserTypeSelector from "./UserTypeSelector";
import { Button } from "./ui/button";
import {
  removeCollaborator,
  updateDocumentAccess,
} from "@/lib/actions/room.actions";
import { useToast } from "./ui/use-toast";

const Collaborator = ({
  collaborator,
  creatorId,
  email,
  roomId,
  user,
}: CollaboratorProps) => {
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserType>(
    collaborator.userType || "viewer"
  );
  const [loading, setLoading] = useState<boolean>(false);

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    const result = await updateDocumentAccess({
      email: collaborator.email,
      roomId,
      userType: type as UserType,
      updatedBy: user,
    });

    if (result.error) {
      toast({
        title: result.error,
        duration: 1000 * 60,
        variant: "destructive",
        className: "dark",
      });
    }

    setLoading(false);
  };
  const removeCollaboratorHandler = async (email: string) => {
    setLoading(true);

    await removeCollaborator({ email, roomId });

    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />
        <div>
          <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
            {collaborator.name}
            <span className="text-10-regular pl-2 text-blue-100">
              {loading && "updating..."}
            </span>
          </p>
          <p className="text-sm font-light text-blue-100">
            {collaborator.email}
          </p>
        </div>
      </div>
      {creatorId === collaborator.id ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            setUserType={setUserType}
            userType={userType || "viewer"}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => removeCollaboratorHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
