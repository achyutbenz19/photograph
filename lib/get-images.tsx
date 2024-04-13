import fs from "fs";
import path from "path";

export function getImagesFromDir(dirPath: string) {
  const directoryPath = path.join(process.cwd(), "public", dirPath);
  const fileNames = fs.readdirSync(directoryPath);
  return fileNames.filter((fileName) =>
    /\.(jpg|jpeg|png|gif)$/i.test(fileName),
  );
}
