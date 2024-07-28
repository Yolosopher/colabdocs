"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { generatePDF } from "@/lib/actions/export.actions";

type MenuBarPluginProps = {
  htmlContent: string;
  font: string;
  roomInfo: {
    email: string;
    title: string;
  };
};

const MenuBarPlugin = ({ htmlContent, font, roomInfo }: MenuBarPluginProps) => {
  const exportAsPDF = async () => {
    generatePDF({
      title: roomInfo.title,
      creator: roomInfo.email,
      htmlContent,
      font,
    });
  };
  const exportAsDOCX = async () => {};
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
            <MenubarItem onClick={exportAsDOCX}>
              <span>As .DOCX</span>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default MenuBarPlugin;
