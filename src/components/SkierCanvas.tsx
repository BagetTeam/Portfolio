import { motion, MotionValue } from "motion/react";
import type { RefObject } from "react";

interface SkierCanvasProps {
  x: MotionValue<number>;
  canvasRef: RefObject<HTMLDivElement | null>;
}

export default function SkierCanvas({ x, canvasRef }: SkierCanvasProps) {
  return (
    <motion.div
      ref={canvasRef}
      style={{
        top: "50%",
        x: x,
        y: "-50%",
        width: "100%",
        height: "100vh",
        position: "fixed",
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
}
