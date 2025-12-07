import { motion, MotionValue } from "motion/react";
import type { RefObject } from "react";

interface MountainCanvasProps {
  x: MotionValue<number>;
  canvasRef: RefObject<HTMLDivElement | null>;
}

export default function MountainCanvas({ x, canvasRef }: MountainCanvasProps) {
  return (
    <div
      ref={canvasRef}
      style={{
        top: "50%",
        width: "100%",
        height: "100vh",
        position: "fixed",
        zIndex: 25,
        pointerEvents: "none",
      }}
    />
  );
}
