import { FC } from "react";
import { FileUploader } from "@/components/FileUploader.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  activeFileIdAtom,
  FileData,
  filesDataAtom,
  TabId,
  tabIdAtom,
} from "@/App.tsx";
import { useSetAtom } from "jotai";

export const UploadPage: FC<{}> = ({}) => {
  const setTabId = useSetAtom(tabIdAtom);
  const setActiveFileId = useSetAtom(activeFileIdAtom);
  const setFilesData = useSetAtom(filesDataAtom);

  const handleFilesSelected = async (data: FileData) => {
    setFilesData((p) => [...p, data]);
    setActiveFileId(data.id);
    setTabId(TabId.viewer);
  };

  return (
    <Card>
      <CardContent>
        <FileUploader onFileUpload={handleFilesSelected} />
      </CardContent>
    </Card>
  );
};
