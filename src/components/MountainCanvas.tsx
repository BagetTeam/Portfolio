import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import type { RefObject } from "react";

interface MountainCanvasProps {
  x: MotionValue<number>;
  canvasRef: RefObject<HTMLDivElement | null>;
}

export default function MountainCanvas({ x, canvasRef }: MountainCanvasProps) {
  const { scrollYProgress } = useScroll();
  
  // The texture scrolls as user scrolls the page
  // Scrolls the texture upward as user scrolls down
  const textureOffsetY = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);

  return (
    <>
      {/* Original canvas ref for Pixi.js (keeping for compatibility) */}
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
      
      {/* Mountain background with true 3D perspective effect */}
      <div
        className="mountain-perspective-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: 5,
          pointerEvents: "none",
          overflow: "hidden",
          // 3D perspective - looking down at the ski slope
          // Lower perspective value = more dramatic 3D effect
          perspective: "600px",
          perspectiveOrigin: "center 80%", // Viewing point is near the bottom
        }}
      >
        {/* The tilted mountain plane - like a ski slope going into the distance */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: "60%",
            height: "700%", // Very tall to extend into the distance
            transform: "translateX(-50%) rotateX(20deg)",
            transformOrigin: "center 4%", // Rotation point at the "horizon"
            transformStyle: "preserve-3d",
            overflow: "hidden",
          }}
        >
          {/* Scrolling mountain texture */}
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              y: textureOffsetY,
            }}
          >
            <img
              src="/mountain-body.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
              }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
