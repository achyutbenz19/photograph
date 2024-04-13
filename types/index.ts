export type FileUploaderProps = {
  focus: boolean;
};

export type FilesProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};
