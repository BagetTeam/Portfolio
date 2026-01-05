import type { MotionValue } from "motion/react";
import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  PerspectiveMesh,
  Texture,
  TilingSprite,
} from "pixi.js";
import { useEffect, useRef } from "react";
import { skierSlope } from "../utils/skierMath";

export async function usePixiApp(
  backgroundCanvasRef: React.RefObject<HTMLDivElement | null>,
  skierCanvasRef: React.RefObject<HTMLDivElement | null>,
  scrollYProgress: MotionValue<number>,
  maxTraversal: number,
  isIdle: boolean = false
) {
  const backgroundAppRef = useRef<Application | null>(null);
  const skierAppRef = useRef<Application | null>(null);
  const isInitializingBackground = useRef(false);
  const isInitializingSkier = useRef(false);
  useEffect(() => {
    async function initPixiBackground() {
      try {
        if (isInitializingBackground.current || backgroundAppRef.current)
          return;
        isInitializingBackground.current = true;
        const app = new Application();
        await app.init({
          backgroundAlpha: 0,
          resizeTo: window,
        });
        backgroundAppRef.current = app;
        requestAnimationFrame(() => {
          if (backgroundCanvasRef.current && app.canvas) {
            console.log("PixiJS background initialized");
            backgroundCanvasRef.current.appendChild(app.canvas);
          }
        });

        await loadMountain(app);
      } catch (error) {
        console.error("Error initializing PixiJS:", error);
      } finally {
        isInitializingBackground.current = false;
      }
    }

    async function initPixiSkier() {
      try {
        if (isInitializingSkier.current || skierAppRef.current) return; // Check both
        isInitializingSkier.current = true;

        const appSkier = new Application();

        // Initialize the application
        await appSkier.init({
          backgroundAlpha: 0,
          resizeTo: window,
        });

        skierAppRef.current = appSkier;

        requestAnimationFrame(() => {
          if (skierCanvasRef.current && appSkier.canvas) {
            console.log("PixiJS skier initialized");
            skierCanvasRef.current.appendChild(appSkier.canvas);
          }
        });

        await loadAnimation(appSkier, scrollYProgress, maxTraversal, isIdle);

        // await loadSprite(app);
      } catch (error) {
        console.error("Error initializing PixiJS:", error);
      } finally {
        isInitializingSkier.current = false;
      }
    }
    if (!backgroundAppRef.current) initPixiBackground();
    if (!skierAppRef.current) initPixiSkier();

    return () => {
      if (backgroundAppRef.current) {
        const app = backgroundAppRef.current;
        app.destroy(true, { children: true, texture: true });
        backgroundAppRef.current = null;
        isInitializingBackground.current = false;
      }
      if (skierAppRef.current) {
        const app = skierAppRef.current;
        app.destroy(true, { children: true, texture: true });
        skierAppRef.current = null;
        isInitializingSkier.current = false;
      }
    };
  }, [skierCanvasRef, backgroundCanvasRef, scrollYProgress, maxTraversal]);
}

async function loadMountain(app: Application) {
  const mountainBody = await Assets.load("/mountain-body.png");
  console.log(mountainBody);

  const mountain = new PerspectiveMesh({
    texture: mountainBody,
    verticesX: 30,
    verticesY: 30,
    // Create a trapezoid that looks like a mountain
    x0: 50,
    y0: 300, // Wide base left
    x1: 250,
    y1: 300, // Wide base right
    x2: 200,
    y2: 100, // Narrower peak right
    x3: 100,
    y3: 100, // Narrower peak left
  });

  // Position on screen
  mountain.position.set(300, 200);
  app.stage.addChild(mountain);
  // layer.addChild(mountain);
}

async function loadAnimation(
  app: Application,
  scrollYProgress: MotionValue<number>,
  maxTraversal: number,
  isIdle: boolean
) {
  Assets.add({
    alias: "sheet",
    src: "/spritesheet.json",
  });
  const sheet = await Assets.load("sheet");

  const idleAnimation = new AnimatedSprite(sheet.animations.idle);
  const walkingAnimation = new AnimatedSprite(sheet.animations.walk);

  const animation = isIdle ? idleAnimation : walkingAnimation;

  let forward = true;

  animation.x = app.screen.width / 2;
  animation.y = app.screen.height / 2;
  animation.anchor.set(0.5);
  animation.animationSpeed = 0.1;
  animation.scale = 0.6;
  animation.play();
  app.stage.addChild(animation);

  app.ticker.add(() => {
    // walkingAnimation.rotation += 0.01;
    const isForward = skierSlope(scrollYProgress.get(), maxTraversal) > 0;
    if (isIdle) animation.textures = sheet.animations.idle;
    else if (isForward !== forward) {
      forward = isForward;
      animation.textures = isForward
        ? sheet.animations.walk
        : sheet.animations.revWalk;
      animation.play();
    }
  });
}
