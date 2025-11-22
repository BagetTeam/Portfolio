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

const landmarks = [
  {
    id: "experience",
    progress: 0.25,
    title: "Experience",
    contentSize: 3,
    color: "bg-blue-50",
    side: "left" as const, // Skier approaches from right
  },
  {
    id: "projects",
    progress: 0.5,
    title: "Projects",
    contentSize: 5,
    color: "bg-green-50",
    side: "right" as const, // Skier approaches from left
  },
  {
    id: "education",
    progress: 0.75,
    title: "Education",
    contentSize: 2,
    color: "bg-yellow-50",
    side: "left" as const, // Skier approaches from right
  },
];
function App() {
  const appRef = useRef<Application | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);
  const [currentLandmark, setCurrentLandmark] = useState<string | null>(null);

  const popupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const adjustedProgress = useMotionValue(0);
  const isScrollingPopup = useRef(false);

  const maxTraversal =
    typeof window !== "undefined" ? window.innerWidth * 0.55 : 300;

  function skierMotion(progress: number) {
    const p = -2.6 * progress + 10;
    console.log(progress);
    const mainCurve =
      Math.sin(2.6 * p * Math.PI + (5 * Math.PI) / 6) * maxTraversal * 0.6;
    const secondaryCurve =
      Math.sin(p * Math.PI - Math.PI / 3) * maxTraversal * 0.3;
    const tertiaryWave = Math.sin(4 * p * Math.PI) * maxTraversal * 0.1;

    return mainCurve + secondaryCurve + tertiaryWave;
  }

  function skierSlope(progress: number) {
    const p = -2.6 * progress + 10;

    const dMain =
      Math.cos(2.6 * p * Math.PI + (5 * Math.PI) / 6) *
      maxTraversal *
      0.6 *
      (2.6 * 2.6 * Math.PI);
    const dSecondary =
      Math.cos(p * Math.PI - Math.PI / 3) *
      maxTraversal *
      0.3 *
      (2.6 * Math.PI);
    const dTertiary =
      Math.cos(4 * p * Math.PI) * maxTraversal * 0.1 * (2.6 * 4 * Math.PI);

    return dMain + dSecondary + dTertiary;
  }

  const x = useTransform(adjustedProgress, skierMotion);
  console.log(x.get());

  function mapScrollToSkierProgress(rawProgress: number): number {
    const slowdownRange = 0.06; // Smaller range
    const slowdownFactor = 1.15; // Minimal slowdown (was much higher before)

    let adjustedProgress = 0;
    let lastEnd = 0;

    const segments: Array<{
      start: number;
      end: number;
      cost: number;
      landmark?: (typeof landmarks)[0];
    }> = [];

    landmarks.forEach((landmark) => {
      const slowdownStart = Math.max(0, landmark.progress - slowdownRange);
      const slowdownEnd = Math.min(1, landmark.progress + slowdownRange);

      // Normal segment before slowdown
      if (lastEnd < slowdownStart) {
        segments.push({
          start: lastEnd,
          end: slowdownStart,
          cost: slowdownStart - lastEnd,
        });
      }

      // Minimal slowdown segment (same across all landmarks)
      segments.push({
        start: slowdownStart,
        end: slowdownEnd,
        cost: (slowdownEnd - slowdownStart) * slowdownFactor,
        landmark,
      });

      lastEnd = slowdownEnd;
    });

    if (lastEnd < 1) {
      segments.push({
        start: lastEnd,
        end: 1,
        cost: 1 - lastEnd,
      });
    }

    const actualTotalCost = segments.reduce((sum, seg) => sum + seg.cost, 0);
    const targetCost = rawProgress * actualTotalCost;
    let accumulatedCost = 0;

    for (const segment of segments) {
      if (accumulatedCost + segment.cost >= targetCost) {
        const costInSegment = targetCost - accumulatedCost;
        const progressInSegment = costInSegment / segment.cost;
        adjustedProgress =
          segment.start + progressInSegment * (segment.end - segment.start);
        return Math.max(0, Math.min(1, adjustedProgress));
      }
      accumulatedCost += segment.cost;
    }

    return 1;
  }

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
      const activationRange = 0.08;
      let active = null;

      for (const landmark of landmarks) {
        if (
          progress >= landmark.progress - activationRange &&
          progress <= landmark.progress + activationRange
        ) {
          active = landmark.id;
          break;
        }
      }

      setCurrentLandmark(active);
    });

    return unsubscribe;
  }, [adjustedProgress]);

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
      const speedFactor = 1 / landmark.contentSize;
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
          } top-1/2 -translate-y-1/2 ${
            landmark.color
          } rounded-xl shadow-2xl p-8 max-w-3xl z-40 border-4 border-gray-800`}
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

            {landmark.id === "experience" && (
              <div className="space-y-8">
                {dummyContent.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-blue-600 pl-6 py-2"
                  >
                    <h3 className="text-2xl font-bold text-gray-900">
                      {exp.title}
                    </h3>
                    <p className="text-lg text-gray-700 font-semibold">
                      {exp.company}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{exp.period}</p>
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm shadow-md hover:bg-blue-700 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {landmark.id === "projects" && (
              <div className="space-y-8">
                {dummyContent.projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-green-600 pl-6 py-2"
                  >
                    <h3 className="text-2xl font-bold text-gray-900">
                      {project.title}
                    </h3>
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-green-600 text-white rounded font-semibold text-sm shadow-md hover:bg-green-700 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <a
                      href={`https://${project.link}`}
                      className="text-green-700 hover:text-green-900 font-semibold underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 {project.link}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {landmark.id === "education" && (
              <div className="space-y-8">
                {dummyContent.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-yellow-600 pl-6 py-2"
                  >
                    <h3 className="text-2xl font-bold text-gray-900">
                      {edu.degree}
                    </h3>
                    <p className="text-lg text-gray-700 font-semibold">
                      {edu.institution}
                    </p>
                    {edu.period && (
                      <p className="text-sm text-gray-600 mb-3">{edu.period}</p>
                    )}
                    {edu.gpa && (
                      <p className="text-gray-800 font-semibold mb-3">
                        GPA: {edu.gpa}
                      </p>
                    )}
                    {edu.highlights && (
                      <ul className="list-disc list-inside text-gray-800 space-y-2 ml-2">
                        {edu.highlights.map((highlight, i) => (
                          <li key={i} className="leading-relaxed">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                    {edu.courses && (
                      <ul className="list-disc list-inside text-gray-800 space-y-2 ml-2">
                        {edu.courses.map((course, i) => (
                          <li key={i} className="leading-relaxed">
                            {course}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
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
