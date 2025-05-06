import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { HistoryList } from "@/components/HistoryList.tsx";
import { useAtom, useSetAtom } from "jotai";
import {
  FileData,
  activeFileIdAtom,
  filesDataAtom,
  tabIdAtom,
  TabId,
} from "@/App.tsx";

export const HistoryPage: FC<{}> = ({}) => {
  const setActiveTab = useSetAtom(tabIdAtom);
  const setActiveFileId = useSetAtom(activeFileIdAtom);
  const [filesData, setFilesData] = useAtom(filesDataAtom);

  const handleSelectFile = (file: FileData) => {
    setActiveFileId(file.id);
    setActiveTab(TabId.viewer);
  };

  const handleRenameFile = (file: FileData, name: string) => {
    setFilesData((prev) => {
      return prev.map((f) => {
        if (f.id === file.id) {
          return { ...f, name };
        }
        return f;
      });
    });
  };

  return (
    <Card>
      <CardContent>
        <HistoryList
          history={filesData}
          onSelectFile={handleSelectFile}
          onClearHistory={() => setFilesData([])}
          onRenameFile={handleRenameFile}
        />
      </CardContent>
    </Card>
  );
};
