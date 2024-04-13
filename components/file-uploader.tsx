import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { FileUploaderProps } from "@/types";
import Files from "./files";
import { Button } from "./ui/button";
import { addFile } from "@/app/api/endpoints";

const FileUploader = ({ focus }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const newFilteredFiles = selectedFiles.filter((file) => {
        if (!["video/mp4", "image/png"].includes(file.type)) {
          toast.error(`Unsupported file type: ${file.name}`);
          return false;
        }
        return true;
      });

      if (newFilteredFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...newFilteredFiles]);
      }
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      await addFile(files);
      toast.success("Uploaded!")
    } catch (err) {
      toast.error("Internal Server Error");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files.length) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      const filteredFiles = droppedFiles.filter((file) => {
        if (!["video/mp4", "image/png"].includes(file.type)) {
          toast.error(
            `Please drop an MP4 or PNG file. ${file.name} is not allowed.`,
          );
          return false;
        }
        return true;
      });

      if (filteredFiles.length > 0) {
        setFiles(filteredFiles);
      }
    }
  };

  const labelText = uploading
    ? "Uploading files..."
    : isDragOver
      ? "Drop files here"
      : files.length > 0
        ? `${files.length} file(s) ready to upload`
        : "Drag and drop MP4 or PNG files here, or click to browse";

  return (
    <div className="p-2 h-full">
      <div
        className={cn(
          "h-full rounded-lg duration-500 transition-all border-dashed border-neutral-700 border-2",
          focus && "border-neutral-800",
        )}
      >
        <div className="w-full m-2">
          <Files files={files} setFiles={setFiles} />
        </div>
        <label
          className="flex flex-col w-full h-full items-center justify-center p-4 space-y-2 cursor-pointer"
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Plus
            className={cn(
              "h-10 w-10 text-neutral-700 duration-500 transition-all",
              focus && "font-extrabold text-neutral-700 dark:text-neutral-300",
            )}
          />
          <span
            className={cn(
              "text-sm text-neutral-700 text-center duration-500 transition-all dark:text-neutral-300",
              focus && "font-bold text-neutral-800 dark:text-neutral-300",
            )}
          >
            {labelText}
          </span>
          {files.length == 0 ? (
            <div
              className={cn(
                "border  border-neutral-700 hover:bg-neutral-100 px-3 duration-500 transition-all py-1.5 rounded-lg",
                focus && "border-2 border-neutral-600 dark:border-neutral-300",
              )}
            >
              Browse
            </div>
          ) : (
            <Button
              onClick={() => handleUpload()}
              className="text-sm"
            >
              Upload
            </Button>
          )}
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".mp4, .png"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default FileUploader;
