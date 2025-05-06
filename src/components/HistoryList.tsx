import { Clock, Trash2, FileText, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FC, useState } from "react";
import { FileData } from "@/App.tsx";

interface HistoryListProps {
  history: FileData[];
  onSelectFile: (file: FileData) => void;
  onClearHistory: () => void;
  onRenameFile: (oldFile: FileData, newName: string) => void;
}

export const HistoryList: FC<HistoryListProps> = ({
  history,
  onSelectFile,
  onClearHistory,
  onRenameFile,
}) => {
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Format date to human-readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const startEditing = (index: number, fileName: string) => {
    setEditingIndex(index);
    setEditingName(fileName);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingName("");
  };

  const saveEditing = (file: FileData) => {
    if (editingName.trim() && editingName !== file.name) {
      onRenameFile(file, editingName);
    }
    setEditingIndex(null);
    setEditingName("");
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Upload History</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your uploaded PDB files will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Upload History</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={onClearHistory}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-4">
          {history.map((file, index) => (
            <div
              key={file.name + index}
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div className="mr-4 p-2 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditing(file);
                        if (e.key === "Escape") cancelEditing();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => saveEditing(file)}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelEditing}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p
                      className="font-medium truncate cursor-pointer"
                      onClick={() => onSelectFile(file)}
                    >
                      {file.name}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(index, file.name);
                      }}
                      className="h-8 w-8 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex text-xs text-muted-foreground mt-1">
                  <span className="mr-4">{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.storedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
