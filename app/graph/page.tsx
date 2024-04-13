"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Graph = dynamic(() => import("../../components/graph"), {
  ssr: false,
});

const ForceGraphComponent = () => {
  const [graph, setGraph] = useState(null);
  const [files, setFiles] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // const graphData = await getGraph();
        // setGraph(graphData);
      } catch (error) {
        console.error("Error fetching graph files:", error);
      }
    }
    const fetchGraph = async () => {
      try {
        // const graphData = await getGraph();
        // setGraph(graphData);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchFiles();
    fetchGraph();
  }, []);

  return (
    <div className="max-h-screen">
      <Graph />
    </div>
  );
};

export default ForceGraphComponent;
