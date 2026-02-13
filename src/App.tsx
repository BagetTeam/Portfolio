import { use, useEffect, useRef, useState } from "react";
import "./index.css";
import {
  motion,
  MotionValue,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { type Landmark } from "./types";
import Header from "./components/Header";
import { useLandmarks } from "./hooks/useLandmarks";
import { useSkierMotion } from "./hooks/useSkierMotion";
import { useActiveLandmark } from "./hooks/useActiveLandmarks";
import { usePixiApp } from "./hooks/usePixi";
import { usePopupScroll } from "./hooks/usePopupScroll";
import SkierCanvas from "./components/SkierCanvas";
import MountainCanvas from "./components/MountainCanvas";
import { useScrollLock } from "./hooks/useScrollLock";

function App() {
  const maxTraversal =
    typeof window !== "undefined" ? window.innerWidth * 0.2 : 300;

  const backgroundCanvasRef = useRef<HTMLDivElement>(null);
  const skierCanvasRef = useRef<HTMLDivElement>(null);

  const popupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLocked = useRef(false);
  const isScrollingPopup = useRef(false);

  const [isInitialAnimation, setIsInitialAnimation] = useState(true);

  const { lockScroll, unlockScroll } = useScrollLock();
  const { scrollYProgress } = useScroll({ target: containerRef });
  const landmarks = useLandmarks(maxTraversal);
  const { adjustedProgress, x, isIdle } = useSkierMotion({
    scrollYProgress,
    landmarks,
    maxTraversal,
    isScrollingPopup,
  });

  const currentLandmark = useActiveLandmark(adjustedProgress, landmarks);

  // skier canvas
  usePixiApp(
    backgroundCanvasRef,
    skierCanvasRef,
    scrollYProgress,
    maxTraversal,
    isIdle,
  );

  usePopupScroll({
    currentLandmark,
    landmarks,
    popupRefs,
    containerRef,
    adjustedProgress,
    isScrollingPopup,
  });

  // initial lock/unlock scroll
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    if (!hasLocked.current) {
      lockScroll();
      hasLocked.current = true;

      setTimeout(() => {
        unlockScroll();
        setIsInitialAnimation(false);
        console.log("unlocked");
      }, 5000);

      return () => {};
    }
  }, [lockScroll, unlockScroll]);

  const scale = useTransform(scrollYProgress, [0, 1], [1, 10]);

  return (
    <div className={`${isInitialAnimation ? "hidden" : ""}`}>
      <div ref={containerRef} className="relative">
        <MountainCanvas x={x} canvasRef={backgroundCanvasRef} />
        <SkierCanvas x={x} canvasRef={skierCanvasRef} />

        {/* Landmark popups with dynamic positioning */}
        {landmarks.map((landmark) => (
          <motion.div
            key={landmark.id}
            ref={(el) => {
              popupRefs.current[landmark.id] = el;
            }}
            className={`fixed ${
              landmark.side === "left" ? "left-8" : "right-8"
            } top-1/2 -translate-y-1/2 rounded-xl shadow-2xl p-8 max-w-3xl z-40 border-4 border-gray-800`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: currentLandmark === landmark.id ? 1 : 0,
              x:
                currentLandmark === landmark.id
                  ? 0
                  : landmark.side === "left"
                    ? -100
                    : 100,
              scale: currentLandmark === landmark.id ? 1 : 0.9,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              pointerEvents: currentLandmark === landmark.id ? "auto" : "none",
              maxHeight: "60vh",
              overflowY: "auto",
              width: "min(600px, 90vw)",
            }}
          >
            <div className="pixel-corners">
              <h2 className="text-4xl font-bold mb-6 text-gray-900 border-b-4 border-gray-800 pb-3">
                {landmark.title}
              </h2>

              {landmark.component()}
            </div>
          </motion.div>
        ))}

        {/* Scrollable sections */}
        <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-300 pt-24">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-gray-900 mb-4">
              Start Your Journey
            </h2>
            <p className="text-2xl text-gray-700">Scroll down to ski! ⛷️</p>
          </div>
        </section>

        <section className="w-full min-h-[700vh]"></section>

        <section className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-gray-900 mb-4">
              End of Journey
            </h2>
            <p className="text-2xl text-gray-700">Thanks for visiting! 🎉</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
