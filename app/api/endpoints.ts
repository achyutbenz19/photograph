import axios, { AxiosResponse } from "axios";
const API_URL = "http://localhost:8000";

export async function addFile(files: File[]): Promise<void> {
  const url = `${API_URL}/add`;
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response: AxiosResponse = await axios.post(url, formData, {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data
}
