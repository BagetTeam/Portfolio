import { useEffect, useRef, useState } from "react";
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

  function initLandmarks() {
    const initLandmarks: Landmark[] = [];
    const criticalPoints: number[] = findCriticalPoints();
    console.log(criticalPoints);
    let i = 0;
    criticalPoints.forEach((progress, index) => {
      if (criticalPointsSkip.includes(index + 1)) return;

      initLandmarks.push({
        id: landmarkTypes[i],
        progress,
        title: landmarkTypes[i],
        side: landmarkPosition[i],
        component: landmarkComponent[i],
      });
      i++;
      console.log(initLandmarks);
    });
    setLandmarks(initLandmarks);
  }

  useEffect(() => {
    initLandmarks();
  }, []);

  useEffect(() => {
    console.log(landmarks);
  }, [landmarks]);

  const x = useTransform(adjustedProgress, skierMotion);
  console.log(x.get());

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (scroll) => {
      if (!isScrollingPopup.current) {
        const mapped = mapScrollToSkierProgress(scroll);
        adjustedProgress.set(mapped);
      }
    });

    return unsubscribe;
  }, [scrollYProgress, adjustedProgress]);

  useEffect(() => {
    const unsubscribe = adjustedProgress.on("change", (progress) => {
      const activationRange = 0.04;
      let active = null;
      console.log(landmarks);
      for (const landmark of landmarks) {
        if (
          progress >= landmark.progress - activationRange &&
          progress <= landmark.progress + activationRange
        ) {
          active = landmark.id;
          break;
        }
      }
      console.log(active);
      setCurrentLandmark(active);
    });

    return unsubscribe;
  }, [adjustedProgress, landmarks]);

  // Handle popup scroll
  useEffect(() => {
    if (!currentLandmark) return;

    const popupElement = popupRefs.current[currentLandmark];
    if (!popupElement) return;

    const landmark = landmarks.find((l) => l.id === currentLandmark);
    if (!landmark) return;

    const handlePopupScroll = () => {
      isScrollingPopup.current = true;

      const scrollTop = popupElement.scrollTop;
      const scrollHeight = popupElement.scrollHeight;
      const clientHeight = popupElement.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) return;

      // Progress through the popup (0 to 1)
      const popupScrollProgress = scrollTop / maxScroll;

      // Map this to the landmark zone
      const landmarkRange = 0.12; // Total range the skier travels through this landmark
      const landmarkStart = landmark.progress - landmarkRange / 2;
      const landmarkEnd = landmark.progress + landmarkRange / 2;

      // Calculate new skier progress based on popup scroll
      // Speed is inversely proportional to content size
      // const speedFactor = 1 / landmark.contentSize;
      const speedFactor = 1;
      const progressThroughLandmark = popupScrollProgress * speedFactor;

      const newSkierProgress = Math.min(
        landmarkEnd,
        landmarkStart + progressThroughLandmark * landmarkRange
      );

      adjustedProgress.set(newSkierProgress);

      // Also update main window scroll to match
      if (containerRef.current) {
        const totalScrollHeight =
          containerRef.current.scrollHeight - window.innerHeight;
        const newMainScroll = newSkierProgress * totalScrollHeight;
        containerRef.current.scrollTop = newMainScroll;
      }

      setTimeout(() => {
        isScrollingPopup.current = false;
      }, 100);
    };

    popupElement.addEventListener("scroll", handlePopupScroll);

    return () => {
      popupElement.removeEventListener("scroll", handlePopupScroll);
    };
  }, [currentLandmark, adjustedProgress]);

  const scale = useTransform(scrollYProgress, [0, 1], [1, 10]);

  async function initPixi() {
    try {
      if (isInitializing.current || appRef.current) return; // Check both
      isInitializing.current = true;

      const app = new Application();

      // Initialize the application
      await app.init({
        backgroundAlpha: 0,
        resizeTo: window,
      });

      appRef.current = app;

      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      await loadAnimation(app);

      // await loadSprite(app);
    } catch (error) {
      console.error("Error initializing PixiJS:", error);
    } finally {
      isInitializing.current = false;
    }
  }

  async function loadAnimation(app: Application) {
    Assets.add({
      alias: "sheet",
      src: "/spritesheet.json",
    });
    const sheet = await Assets.load("sheet");

    const walkingAnimation = new AnimatedSprite(sheet.animations.walk);

    let forward = true;

    walkingAnimation.x = app.screen.width / 2;
    walkingAnimation.y = app.screen.height / 2;

    walkingAnimation.anchor.set(0.5);
    walkingAnimation.animationSpeed = 0.1;
    walkingAnimation.scale = 0.6;
    walkingAnimation.play();

    app.stage.addChild(walkingAnimation);

    // walkingAnimation.eventMode = "static";
    // walkingAnimation.cursor = "pointer";
    // walkingAnimation.on("pointertap", () => {
    //   forward = !forward;
    //   if (forward) {
    //     walkingAnimation.textures = sheet.animations.walk;
    //   } else {
    //     walkingAnimation.textures = sheet.animations.revWalk;
    //   }
    //   walkingAnimation.play();
    // });
    // Animate the rotation
    app.ticker.add(() => {
      // walkingAnimation.rotation += 0.01;
      const isForward = skierSlope(scrollYProgress.get()) > 0;
      if (isForward !== forward) {
        forward = isForward;
        walkingAnimation.textures = isForward
          ? sheet.animations.walk
          : sheet.animations.revWalk;
        walkingAnimation.play();
      }
    });
  }

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
