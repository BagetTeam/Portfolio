import type { JSX } from "react";

export type Landmark = {
  id: string;
  progress: number;
  title: string;
  side: "left" | "right";
  component: JSX.Element;
};
