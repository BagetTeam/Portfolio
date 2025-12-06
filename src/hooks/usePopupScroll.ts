import { useEffect, useRef } from "react";
import type { Landmark } from "../types";
import type { MotionValue } from "motion/react";

interface UsePopupScrollProps {
  currentLandmark: string | null;
  landmarks: Landmark[];
  popupRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  containerRef: React.RefObject<HTMLDivElement>;
  adjustedProgress: MotionValue<number>;
  isScrollingPopup: React.RefObject<boolean>;
}

export function usePopupScroll({
  currentLandmark,
  landmarks,
  popupRefs,
  containerRef,
  adjustedProgress,
  isScrollingPopup,
}: UsePopupScrollProps) {
  // Handle popup scroll
  useEffect(() => {
    if (!currentLandmark) return;

    const popupElement = popupRefs.current[currentLandmark];
    if (!popupElement) return;

    const landmark = landmarks.find((l) => l.id === currentLandmark);
    if (!landmark || !landmark.progress) return;

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
      const landmarkStart = landmark.progress! - landmarkRange / 2;
      const landmarkEnd = landmark.progress! + landmarkRange / 2;

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
  }, [
    currentLandmark,
    adjustedProgress,
    landmarks,
    popupRefs,
    containerRef,
    isScrollingPopup,
  ]);
}
