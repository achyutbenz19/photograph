export type FileUploaderProps = {
  focus: boolean;
};

export type FilesProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export type Node = {
  id: number;
  type: string;
  content: string;
};

export type Link = {
  source: any;
  target: any;
};
