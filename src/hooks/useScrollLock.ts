import { useCallback } from "react";

export const useScrollLock = () => {
  const lockScroll = useCallback(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
  }, []);

  const unlockScroll = useCallback(() => {
    // 1. Get the scroll position from the inline style BEFORE clearing it
    const scrollY = document.body.style.top;

    // 2. Clear the styles
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    // 3. Scroll back (strip the 'px' and the minus sign)
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, []);

  return { lockScroll, unlockScroll };
};
