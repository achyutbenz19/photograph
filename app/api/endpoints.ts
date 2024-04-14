import axios, { AxiosResponse } from "axios";
const API_URL = "http://localhost:8000";

export async function addFile(files: File[]): Promise<void> {
  const url = `${API_URL}/add`;
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response: AxiosResponse = await axios.post(url, formData, {
    headers: {
      accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function getNodes() {
  const url = `${API_URL}/nodes`;
  const response: AxiosResponse = await axios.get(url);
  return response?.data;
}

export async function getEdges() {
  const url = `${API_URL}/edges`;
  const response: AxiosResponse = await axios.get(url);
  return response?.data;
}

export async function generateSummary(node: string, neighbours: any) {
  const data = {
    node: node,
    neighbours: neighbours
  };
  const response = await fetch(`${API_URL}/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.body) {
    throw new Error("Failed to generate summary");
  }

  const reader = response.body.getReader();
  return (async function* () {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield new TextDecoder("utf-8").decode(value, { stream: true });
    }
  })();

}