export type FileUploaderProps = {
  focus: boolean;
};

export type FilesProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export type Node = {
  id: number;
  img: string;
};

export type Link = {
  source: number;
  target: number;
};
