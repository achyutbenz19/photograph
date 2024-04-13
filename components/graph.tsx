"use client";
import { Link, Node } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import * as THREE from "three";

const Graph = ({ graph }: any) => {
  const [gData, setGData] = useState<any>({ nodes: [], links: [] });
  const fgRef = useRef<any>();
  const imgs = [
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
    "cat.jpg",
  ];

  useEffect(() => {
    const nodes: Node[] = imgs.map((img, id) => ({ id, img }));
    const links: Link[] = nodes
      .map((node, id) => ({
        source: id,
        target: Math.max(0, Math.floor(Math.random() * id)),
      }))
      .filter((link) => link.source !== link.target);

    setGData({ nodes, links });
  }, []);

  const handleClick = useCallback(
    (node: any) => {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fgRef.current?.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        3000,
      );
    },
    [fgRef],
  );

  return (
    <div className="max-h-screen">
      <ForceGraph3D
        ref={fgRef}
        onNodeClick={handleClick}
        graphData={gData}
        nodeThreeObject={(node: Node) => {
          const imgTexture = new THREE.TextureLoader().load(`/${node.img}`);
          imgTexture.colorSpace = THREE.SRGBColorSpace;
          const material = new THREE.SpriteMaterial({ map: imgTexture });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(12, 12, 0);
          return sprite;
        }}
      />
    </div>
  );
};

export default Graph;
