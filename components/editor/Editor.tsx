"use client";

import Theme from "./plugins/Theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import React, { useRef, useState } from "react";
import {
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useEditorStatus,
} from "@liveblocks/react-lexical";
import Loader from "../Loader";
import FloatingToolbarPlugin from "./plugins/FloatingToolbarPlugin";
import { useThreads } from "@liveblocks/react/suspense";
import Comments from "../Comments";
import { DeleteModal } from "../DeleteModal";
import MenuBarPlugin from "./plugins/MenuBarPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useReactToPrint } from "react-to-print";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export function Editor({
  roomId,
  currentUserType,
  roomMetadata,
}: {
  roomId: string;
  currentUserType: UserType;
  roomMetadata: RoomMetadata;
}) {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const [temporaryColorState, setTemporaryColorState] = useState<string>("");
  const status = useEditorStatus();
  const { threads } = useThreads();

  const initialConfig = liveblocksConfig({
    namespace: "Editor",
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === "editor",
  });

  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef?.current,
  });
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <div className="toolbar-wrapper flex min-w-full justify-between items-center">
          <div className="flex items-center gap-2 py-2">
            {roomMetadata && (
              <MenuBarPlugin
                setTemporaryColorState={setTemporaryColorState}
                temporaryColorState={temporaryColorState}
                rootElement={rootElement}
                font="Helvetica"
                roomInfo={{
                  title: roomMetadata.title,
                  email: roomMetadata.email,
                }}
                handlePrint={handlePrint}
              />
            )}
            <ToolbarPlugin />
          </div>
          {currentUserType === "editor" && <DeleteModal roomId={roomId} />}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {status === "not-loaded" || status === "loading" ? (
            <Loader />
          ) : (
            <div
              className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10"
              ref={componentRef}
            >
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-input h-full  !outline-none"
                    style={{
                      color: `${temporaryColorState}`,
                    }}
                  />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === "editor" && <FloatingToolbarPlugin />}
              <OnChangePlugin
                onChange={(editorState, editor) => {
                  editorState.read(() => {
                    const rootElement = editor.getRootElement();
                    setRootElement(rootElement);

                    // const html = $generateHtmlFromNodes(editor);
                    // setRootElement(html);
                  });
                }}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}

          {!temporaryColorState && (
            <LiveblocksPlugin>
              <FloatingComposer className="w-[350px]" />
              <FloatingThreads threads={threads} />
              <Comments />
            </LiveblocksPlugin>
          )}
        </div>
      </div>
    </LexicalComposer>
  );
}
