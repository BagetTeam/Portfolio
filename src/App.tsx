import { useEffect, useRef, useState } from "react";
import "./index.css";
import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Sprite,
} from "pixi.js";

function App() {
  const [count, setCount] = useState(0);
  const appRef = useRef<Application | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);

  async function initPixi() {
    try {
      if (isInitializing.current || appRef.current) return; // Check both
      isInitializing.current = true;

      const app = new Application();

      // Initialize the application
      await app.init({
        background: "#1099bb",
        resizeTo: window,
      });

      appRef.current = app;

      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      // Load the textures
      // const sheet = await Assets.load("/spritesheet.json");
      // const animation = await AnimatedSprite.from(sheet.animations["idle"]);

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
    } catch (error) {
      console.error("Error initializing PixiJS:", error);
      isInitializing.current = false;
    }
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
      <div className="w-full h-full items-center justify-items-center">
        <div
          ref={canvasRef}
          style={{ width: "100%", height: "100vh", position: "relative" }}
        ></div>
      </div>
      <section
        id="experience"
        className="h-screen bg-blue-100 flex items-center justify-center"
      >
        <h2>Experience</h2>
      </section>
      <section
        id="projects"
        className="h-screen bg-green-100 flex items-center justify-center"
      >
        <h2>Projects</h2>
      </section>
      <section
        id="education"
        className="h-screen bg-yellow-100 flex items-center justify-center"
      >
        <h2>Education</h2>
      </section>
    </div>
  );
}

export default App;
