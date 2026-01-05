import { useEffect, useRef, useState } from "react";
import { useMotionValue, useTransform, MotionValue } from "motion/react";
import { skierMotion, mapScrollToSkierProgress } from "../utils/skierMath";
import { type Landmark } from "../types";

interface UseSkierMotionProps {
  scrollYProgress: MotionValue<number>;
  landmarks: Landmark[];
  maxTraversal: number;
  isScrollingPopup: React.RefObject<boolean>;
}

export function useSkierMotion({
  scrollYProgress,
  landmarks,
  maxTraversal,
  isScrollingPopup,
}: UseSkierMotionProps) {
  const adjustedProgress = useMotionValue(0);
  const [isIdle, setIsIdle] = useState(true);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const x = useTransform(adjustedProgress, (progress) =>
    skierMotion(progress, maxTraversal)
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (scroll) => {
      if (!isScrollingPopup.current) {
        const mapped = mapScrollToSkierProgress(scroll, landmarks);
        adjustedProgress.set(mapped);
      }
    });

    return unsubscribe;
  }, [scrollYProgress, adjustedProgress, landmarks, isScrollingPopup]);

  return { adjustedProgress, x };
}
