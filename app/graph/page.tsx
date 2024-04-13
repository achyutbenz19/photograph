"use client";
import dynamic from "next/dynamic";
import GraphComponent from "../../components/graph";

const Graph = dynamic(() => import("../../components/graph"), {
  ssr: false,
});

const ForceGraphComponent = ({}) => {
  return (
    <div className="max-h-screen">
      <Graph />
    </div>
  );
};

export default ForceGraphComponent;
