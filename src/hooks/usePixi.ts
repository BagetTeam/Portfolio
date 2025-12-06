import type { MotionValue } from "motion/react";
import { AnimatedSprite, Application, Assets } from "pixi.js";
import { use, useEffect, useRef } from "react";
import { skierSlope } from "../utils/skierMath";

export async function usePixiApp(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  scrollYProgress: MotionValue<number>,
  maxTraversal: number
) {
  const appRef = useRef<Application | null>(null);
  const isInitializing = useRef(false);
  useEffect(() => {
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

        await loadAnimation(app, scrollYProgress, maxTraversal);

        // await loadSprite(app);
      } catch (error) {
        console.error("Error initializing PixiJS:", error);
      } finally {
        isInitializing.current = false;
      }
    }
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
  }, [canvasRef, scrollYProgress, maxTraversal]);
}

async function loadAnimation(
  app: Application,
  scrollYProgress: MotionValue<number>,
  maxTraversal: number
) {
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
    const isForward = skierSlope(scrollYProgress.get(), maxTraversal) > 0;
    if (isForward !== forward) {
      forward = isForward;
      walkingAnimation.textures = isForward
        ? sheet.animations.walk
        : sheet.animations.revWalk;
      walkingAnimation.play();
    }
  });
}
