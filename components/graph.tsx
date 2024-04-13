import { Link, Node } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import * as THREE from "three";
import SpriteText from "three-spritetext";

const Graph = ({ graph }: any) => {
  const [gData, setGData] = useState<{ nodes: Node[]; links: Link[] }>({
    nodes: [],
    links: [],
  });
  const fgRef = useRef<any>();
  const [hover, setHover] = useState<any>([]);

  useEffect(() => {
    const contents = [
      { type: "image", content: "cat.jpg" },
      { type: "image", content: "cat.jpg" },
      { type: "image", content: "cat.jpg" },
      { type: "image", content: "cat.jpg" },
      { type: "text", content: "apple" },
      { type: "text", content: "apple" },
      { type: "text", content: "apple" },
      { type: "text", content: "apple" },
      { type: "text", content: "apple" },
    ];

    const nodes: Node[] = contents.map((content, id) => ({
      ...content,
      id,
    }));

    const links: Link[] = nodes
      .map((node, id) => ({
        source: id,
        target: Math.max(0, Math.floor(Math.random() * id)),
      }))
      .filter((link) => link.source !== link.target);

    console.log(links);

    setGData({ nodes, links });
  }, []);

  console.log(gData);

  const handleClick = useCallback((node: any) => {
    const distance = 40;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    fgRef.current?.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      3000,
    );
  }, []);

  const findConnections = (id: number) => {
    const connections = [];
    for (const link of gData.links) {
      if (link.source.id === id || link.target.id === id) {
        connections.push({
          link: id == link.source.id ? link.target.id : link.source.id,
        });
      }
    }
    console.log(connections);
    return connections;
  };

  return (
    <div className="max-h-screen">
      <div className="z-20 absolute top-0 left-0 text-white h-20 m-2">
        {hover?.content}
        <br />
        {hover?.id}
        <br />
        {findConnections(hover?.id).map((connection, index) => (
          <div key={index}>Connections with Ids: {connection.link}</div>
        ))}
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
      <ForceGraph3D
        ref={fgRef}
        onNodeClick={handleClick}
        onNodeHover={(node: any) => {
          setHover(node);
        }}
        graphData={gData}
        linkDirectionalParticles={hover ? 10 : 2}
        linkWidth={1}
        nodeLabel="content"
        nodeThreeObject={(node: Node) => {
          if (node.type === "image") {
            const imgTexture = new THREE.TextureLoader().load(
              `/${node.content}`,
            );
            const material = new THREE.SpriteMaterial({ map: imgTexture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(12, 12, 0);
            return sprite;
          } else {
            const sprite = new SpriteText(node.content);
            sprite.color = "green";
            sprite.textHeight = 8;
            return sprite;
          }
        }}
      />
    </div>
  );
};

export default Graph;
