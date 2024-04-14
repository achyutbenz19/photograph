import { getEdges, getNodes } from "@/app/api/endpoints";
import { useModal } from "@/hooks/use-modal-store";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";

const GraphComponent = () => {
  const fgRef = useRef<any>();
  const [gData, setGData] = useState<any>(null);
  const [hover, setHover] = useState<any>([]);
  const { onOpen } = useModal();

  useEffect(() => {
    const fetchNodesAndEdges = async () => {
      try {
        const nodes = await getNodes();
        const edges = await getEdges();
        const formattedNodes = nodes?.map((node: any) => ({
          id: node?.id,
          description: node?.data,
        }));

        const formattedEdges = edges?.map((edge: any) => ({
          source: edge.from,
          target: edge.to,
          content: edge.data,
          pageContent: edge.page_content,
        }));

        const graphData = {
          nodes: formattedNodes,
          links: formattedEdges,
        };
        setGData(graphData);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchNodesAndEdges();
  }, []);

  useEffect(() => {
    setGData(gData);
  }, [gData]);

  const handleClick = (node: any) => {
    const distance = 40;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    fgRef.current?.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      3000,
    );
    onOpen(findConnections(node?.id));
  };

  const findConnections = (id: string) => {
    const connections: any = [];
    if (gData !== null) {
      for (const connection of gData.links) {
        if (connection.source.id === id || connection.target.id === id) {
          connections.push({
            connection:
              id == connection.source.id
                ? connection.target.description
                : connection.source.description,
            data: connection.pageContent,
            description: connection.content,
          });
        }
      }
      return connections;
    }
  };

  return (
    <div className="max-h-screen">
      <div className="z-20 absolute flex flex-col space-y-2 top-0 left-0 text-white h-20 m-2">
        <h2 className="text-5xl capitalize">{hover?.node?.description}</h2>
        <h4 className="">
          {hover &&
            findConnections(hover?.node?.id)?.map(
              (relation: any, index: number) => (
                <div key={index}>{relation.connection}</div>
              ),
            )}
        </h4>
        {hover?.id}
        <br />
        {hover && hover?.type === "image" && (
          <Image
            src={`/${hover?.content}`}
            alt=""
            className="mt-2"
            height={100}
            width={100}
          />
        )}
      </div>
      {gData && (
        <ForceGraph3D
          ref={fgRef}
          linkLabel="content"
          nodeLabel="description"
          graphData={gData!}
          onNodeClick={handleClick}
          onNodeHover={(node: any, edge: any) => {
            setHover({ node, edge });
          }}
          linkDirectionalParticles={hover ? 10 : 2}
          linkWidth={1}
        />
      )}
    </div>
  );
};

export default GraphComponent;
