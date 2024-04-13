import { FilesProps } from "@/types";
import { X } from "lucide-react";
import React, { useCallback } from "react";

const Files = ({ files, setFiles }: FilesProps) => {
  const handleDelete = useCallback((indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  return (
    <div className="w-full flex flex-wrap gap-1.5 flex-row">
      {files.map((file, index) => (
        <div
          className="border shadow-sm items-center justify-center rounded-lg p-2 flex flex-row space-x-1"
          key={index}
        >
          <span className="truncate  max-w-[100px] text-sm">{file.name}</span>
          <X
            className="h-4 w-4 cursor-pointer"
            onClick={() => handleDelete(index)}
          />
        </div>
      ))}
    </div>
  );
};

export default Files;
