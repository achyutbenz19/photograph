export type FileUploaderProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  focus: boolean;
};

export type FilesProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};
