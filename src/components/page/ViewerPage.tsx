import { FC } from "react";
import { activeFileIdAtom, filesDataAtom, tabIdAtom } from "@/App.tsx";
import { useAtomValue, useSetAtom } from "jotai";
import { MolViewer } from "@/components/MolViewer.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export const ViewerPage: FC<{}> = ({}) => {
  const activeFileId = useAtomValue(activeFileIdAtom);
  const filesData = useAtomValue(filesDataAtom);
  const setActiveTab = useSetAtom(tabIdAtom);

  const activeFile = filesData.find((file) => file.id === activeFileId);

  if (!activeFile) {
    return <div className="text-center text-gray-500">No file selected</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{activeFile.name}</h2>
        <Button
          variant="outline"
          onClick={() => setActiveTab("upload")}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Another
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <MolViewer pdbText={activeFile.content} />
        </CardContent>
      </Card>
    </div>
  );
};
