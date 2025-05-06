import { FC } from "react";
import "./App.css";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { UploadPage } from "@/components/page/UploadPage.tsx";
import { ViewerPage } from "@/components/page/ViewerPage.tsx";
import { HistoryPage } from "@/components/page/HistoryPage.tsx";
import "3dmol";

export interface FileData {
  id: string;
  name: string;
  content: string;
  size: number;
  storedAt: string;
}

const STORAGE_KEY = "uploadedFiles";

export const TabId = {
  upload: "upload",
  viewer: "viewer",
  history: "history",
} as const;

export type TabId = (typeof TabId)[keyof typeof TabId];

export const tabIdAtom = atom<TabId>(TabId.upload);
export const activeFileIdAtom = atom<string | null>(null);
export const filesDataAtom = atomWithStorage<FileData[]>(STORAGE_KEY, []);

export const App: FC = () => {
  const [tabId, setTabId] = useAtom(tabIdAtom);
  const filesData = useAtomValue(filesDataAtom);

  return (
    <div className="App">
      <Tabs
        value={tabId}
        className="w-full"
        onValueChange={(v) => setTabId(v as TabId)}
      >
        <TabsList className="w-full h-full grid grid-cols-3">
          <TabsTrigger
            value={TabId.upload}
            className="flex-1 text-center py-2 text-lg"
          >
            Upload
          </TabsTrigger>

          <TabsTrigger
            value={TabId.viewer}
            className="flex-1 text-center py-2 text-lg"
          >
            Viewer
          </TabsTrigger>

          <TabsTrigger
            value={TabId.history}
            className="flex-1 text-center py-2 text-lg"
          >
            History ({filesData.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={TabId.upload} className="mt-4 w-full">
          <UploadPage />
        </TabsContent>

        <TabsContent value={TabId.viewer} className="mt-4 w-full">
          <ViewerPage />
        </TabsContent>

        <TabsContent value={TabId.history} className="mt-4 w-full">
          <HistoryPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};
