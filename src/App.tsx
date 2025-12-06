import { use, useEffect, useRef, useState } from "react";
import "./index.css";
import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Sprite,
  Texture,
} from "pixi.js";
import {
  motion,
  MotionValue,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { dummyContent } from "./data/dummydata";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Education from "./sections/Education";
import { type Landmark } from "./types";
import AboutMe from "./sections/AboutMe";

const criticalPointsSkip = [1, 4, 7];
const landmarkTypes = ["aboutMe", "experience", "projects", "education"];
const landmarkPosition: ("left" | "right")[] = [
  "right",
  "left",
  "left",
  "right",
];
const landmarkComponent = [
  <AboutMe />,
  <Experience />,
  <Projects />,
  <Education />,
];

function App() {
  const appRef = useRef<Application | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);
  const [currentLandmark, setCurrentLandmark] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  const popupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const adjustedProgress = useMotionValue(0);
  const isScrollingPopup = useRef(false);

  const maxTraversal =
    typeof window !== "undefined" ? window.innerWidth * 0.2 : 300;

  useEffect(() => {
    const landmarks = useLandmarks(maxTraversal);
  }, []);

  useEffect(() => {
    console.log(landmarks);
  }, [landmarks]);

  const scale = useTransform(scrollYProgress, [0, 1], [1, 10]);

  useEffect(() => {
    if (appRef.current) return;

    initPixi();

    return () => {
      if (appRef.current) {
        const app = appRef.current;
        app.destroy(true, { children: true, texture: true });
        appRef.current = null;
        isInitializing.current = false;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <header className="fixed top-0 left-0 z-10 p-6 bg-white/90 backdrop-blur shadow-md w-full">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Creative Portfolio
        </h1>
      </header>

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

            {landmark.component}
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

      <section className="w-full min-h-[200vh] bg-gradient-to-b from-blue-300 via-blue-200 to-cyan-300"></section>

      <section className="w-full min-h-[300vh] bg-gradient-to-b from-cyan-300 via-cyan-200 to-green-300"></section>

      <section className="w-full min-h-[200vh] bg-gradient-to-b from-green-300 via-green-200 to-emerald-300"></section>

      <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-300 to-teal-400">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-gray-900 mb-4">
            End of Journey
          </h2>
          <p className="text-2xl text-gray-700">Thanks for visiting! 🎉</p>
        </div>
      </section>
    </div>
  );
}

export default App;
