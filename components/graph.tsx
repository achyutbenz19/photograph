import { generateSummary, getEdges, getNodes } from "@/app/api/endpoints";
import { useModal } from "@/hooks/use-modal-store";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";

const GraphComponent = () => {
  const fgRef = useRef<any>();
  const [gData, setGData] = useState<any>(null);
  const [hover, setHover] = useState<any>([]);
  const [summary, setSummary] = useState<any>('')
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

  useEffect(() => {
    const fetchSummary = async () => {
      setSummary("");
      if (!hover?.node?.id) {
        return;
      }

      try {
        const generator = generateSummary(hover?.node.description, findConnections(hover.node.id));

        for await (const summary of await generator) {
          setSummary((prev: any) => [...prev, summary]);
        }
      } catch (error) {
        toast.error("429 Resource has been exhausted (check quota)")
      }
    };

    fetchSummary();
  }, [hover?.node]);

  return (
    <div className="max-h-screen">
      <Link href="/" className="absolute z-20 m-2 bottom-0 left-0">
        <Button className="bg-transparent">
          <ArrowLeft />
        </Button>
      </Link>
      <div className="z-20 font-semibold absolute flex flex-col space-y-2 top-0 left-0 text-white h-20 m-2">
        <h2 className="text-5xl capitalize">{hover?.node?.description}</h2>
        <h4 className="space-y-1 text-lg">
          {hover &&
            findConnections(hover?.node?.id)?.map(
              (relation: any, index: number) => (
                <div key={index}>{relation.connection}</div>
              ),
            )}
        </h4>
        <motion.h5
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75 }}
          className="relative w-[20%]"
        >
          {hover && summary}
        </motion.h5>
        {hover?.id}
        <br />
      </div>
      {gData && (
        <ForceGraph3D
          ref={fgRef}
          showNavInfo={false}
          linkLabel="content"
          nodeLabel="description"
          graphData={gData!}
          linkAutoColorBy="pageContent"
          nodeAutoColorBy="id"
          onNodeClick={handleClick}
          onNodeHover={(node: any, edge: any) => {
            setHover({ node, edge });
          }}
          linkDirectionalParticles={hover ? 10 : 2}
          linkWidth={2}
        />
      )}
    </div>
  );
};

export default GraphComponent;
