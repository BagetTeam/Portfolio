import { useEffect, useState } from "react";
import { MotionValue } from "motion/react";
import { type Landmark } from "../types";

export function useActiveLandmark(
  adjustedProgress: MotionValue<number>,
  landmarks: Landmark[]
) {
  const [currentLandmark, setCurrentLandmark] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = adjustedProgress.on("change", (progress) => {
      const activationRange = 0.04;
      let active = null;

      for (const landmark of landmarks) {
        if (!landmark.progress) continue;
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
  }, [adjustedProgress, landmarks]);

  return currentLandmark;
}
