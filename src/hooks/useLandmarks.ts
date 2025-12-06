import { useEffect, useState } from "react";
import { findCriticalPoints } from "../utils/skierMath";
import {
  CRITICAL_POINTS_SKIP,
  LANDMARK_CONFIGS,
} from "../utils/landmarkConfigs";
import { type Landmark } from "../types";

export function useLandmarks(maxTraversal: number) {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  useEffect(() => {
    const criticalPoints = findCriticalPoints(maxTraversal);
    const initLandmarks: Landmark[] = [];
    let configIndex = 0;

    criticalPoints.forEach((progress, index) => {
      if (CRITICAL_POINTS_SKIP.includes(index + 1)) return;
      if (configIndex >= LANDMARK_CONFIGS.length) return;

      const config = LANDMARK_CONFIGS[configIndex];
      initLandmarks.push({
        ...config,
        progress,
      });
      configIndex++;
    });

    setLandmarks(initLandmarks);
  }, [maxTraversal]);

  return landmarks;
}
