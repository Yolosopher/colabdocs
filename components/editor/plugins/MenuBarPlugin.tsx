/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { generateDoc, generatePDF } from "@/lib/exportAs";
import { useEffect } from "react";

type MenuBarPluginProps = {
  temporaryColorState: string;
  setTemporaryColorState: (color: string) => void;
  rootElement: HTMLElement | null;
  font: string;
  roomInfo: {
    email: string;
    title: string;
  };
};

const MenuBarPlugin = ({
  temporaryColorState,
  setTemporaryColorState,
  rootElement,
  font,
  roomInfo,
}: MenuBarPluginProps) => {
  const exportAsPDF = async () => {
    setTemporaryColorState("black");
  };
  const exportAsDOC = async () => {
    generateDoc({
      title: roomInfo.title,
      creator: roomInfo.email,
      rootElement: rootElement,
      font,
    });
  };

  useEffect(() => {
    const handler = async () => {
      if (temporaryColorState) {
        try {
          await generatePDF({
            title: roomInfo.title,
            creator: roomInfo.email,
            rootElement: rootElement,
            font,
          });
        } catch (error) {
          console.error(error);
        } finally {
          setTemporaryColorState("");
        }
      }
    };
    handler();
  }, [temporaryColorState]);

  return (
    <div className="dark">
      <Menubar className="text-white">
        <MenubarMenu>
          <MenubarTrigger>Export</MenubarTrigger>
          <MenubarContent containerClassName="dark">
            <MenubarItem onClick={exportAsPDF}>
              <span>As .PDF</span>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={exportAsDOC}>
              <span>As .DOC</span>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default MenuBarPlugin;
