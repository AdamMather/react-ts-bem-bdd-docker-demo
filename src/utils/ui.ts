import { useEffect, useRef, useState } from 'react';

export const toggleSelectedId = (currentIds: number[], id: number): number[] =>
  currentIds.includes(id) ? currentIds.filter((item) => item !== id) : [...currentIds, id];

export const useTimedBanner = (dismissAfterMs = 2500) => {
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
  }, []);

  const showBanner = (message: string) => {
    setBannerMessage(message);

    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }

    bannerTimeoutRef.current = setTimeout(() => {
      setBannerMessage(null);
    }, dismissAfterMs);
  };

  return { bannerMessage, showBanner };
};
