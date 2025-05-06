import type React from "react";
import type { FC } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { FileText, Upload } from "lucide-react";
import { FileData } from "@/App.tsx";
import { nanoid } from "nanoid";

interface FileUploaderProps {
  onFileUpload: (file: FileData) => void;
}

export const FileUploader: FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdb")) {
      alert("Please upload a PDB file (.pdb extension)");
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        const pdbFile: FileData = {
          id: nanoid(),
          name: file.name,
          content: event.target.result,
          size: file.size,
          storedAt: new Date().toISOString(),
        };

        onFileUpload(pdbFile);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      alert("Error reading file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-primary/10 p-4">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload PDB File</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop your PDB file here, or click to browse
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdb"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Browse Files
        </Button>
      </div>
    </div>
  );
};
