import { useEffect, useState } from "react";

const readMatch = (query: string) => (
  typeof window !== "undefined" ? window.matchMedia(query).matches : false
);

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => readMatch(query));

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
};
