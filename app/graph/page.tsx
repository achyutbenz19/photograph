"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getEdges, getNodes } from "../api/endpoints";

const Graph = dynamic(() => import("../../components/graph"), {
  ssr: false,
});

const ForceGraphComponent = () => {
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);

  useEffect(() => {
    const fetchNodesAndEdges = async () => {
      try {
        const nodeResponse = await getNodes();
        const edgeResponse = await getEdges();
        setNodes(nodeResponse);
        setEdges(edgeResponse);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchNodesAndEdges();
  }, []);

  console.log(nodes);
  console.log(edges);
  return (
    <div className="max-h-screen">
      <Graph />
    </div>
  );
};

export default ForceGraphComponent;
