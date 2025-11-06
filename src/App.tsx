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
import { motion, MotionValue, useScroll, useTransform } from "motion/react";

function App() {
  const appRef = useRef<Application | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);

  const { scrollYProgress } = useScroll();

  const x = useTransform(
    scrollYProgress,
    (progress) => Math.sin(progress * Math.PI * 2 * 1.5) * (screen.width * 0.4)
  );

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

    walkingAnimation.eventMode = "static";
    walkingAnimation.cursor = "pointer";
    walkingAnimation.on("pointertap", () => {
      forward = !forward;
      if (forward) {
        walkingAnimation.textures = sheet.animations.walk;
      } else {
        walkingAnimation.textures = sheet.animations.revWalk;
      }
      walkingAnimation.play();
    });
    // Animate the rotation
    app.ticker.add(() => {
      walkingAnimation.rotation += 0.01;
    });
  }

  async function loadSprite(app: Application) {
    // Load the textures
    const alien1texture = await Assets.load("/ezgif-split/character000.png");
    const alien2texture = await Assets.load("/ezgif-split/character001.png");
    let isAlien1 = true;

    // Create a new alien Sprite using the 1st texture and add it to the stage
    const character = new Sprite(alien1texture);

    // Center the sprites anchor point
    character.anchor.set(0.5);

    // Move the sprite to the center of the screen
    character.x = app.screen.width / 2;
    character.y = app.screen.height / 2;
    app.stage.addChild(character);

    // Make the sprite interactive
    character.eventMode = "static";
    character.cursor = "pointer";
    character.on("pointertap", () => {
      isAlien1 = !isAlien1;
      // Dynamically swap the texture
      character.texture = isAlien1 ? alien1texture : alien2texture;
    });
    app.ticker.add(() => {
      character.rotation += 0.02;
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
    <div className="h-full w-full">
      <header className="absolute top-0 left-0 z-10 p-4 bg-white">
        <h1>Welcome to my portfolio</h1>
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
          // scale: scale,
          zIndex: 50,
        }}
      ></motion.div>

      <section
        id="experience"
        className="w-full h-screen bg-blue-100 flex items-center justify-center"
      >
        <h2>
          Experience asdawd a a diahiu dhadh aiwh diuah wdiuahw id hawiud
          hawiudh uiah diuah iu h
        </h2>
      </section>
      <section
        id="projects"
        className="w-full h-screen bg-green-100 flex items-center justify-center"
      >
        <h2>Projects</h2>
      </section>
      <section
        id="education"
        className="w-full h-screen bg-yellow-100 flex items-center justify-center"
      >
        <h2>Education</h2>
      </section>
    </div>
  );
}

export default App;
