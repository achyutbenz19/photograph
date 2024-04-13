import axios from "axios";
const API_URL = "http://localhost:8000";

export const addFile = async (files: File[]) => {
  const data = {
    files: files,
  };
  const response = await axios.post(`${API_URL}/add`, data);
  return response.data;
};
