import { useState, useEffect } from "react";

const useMediaQuery = (query) => {
    const media = typeof window !== "undefined" ? window.matchMedia(query) : null;
    const [matches, setMatches] = useState(media?.matches || false);

    useEffect(() => {
        if (!media) return;

        const updateMatch = () => setMatches(media.matches);
        media.addEventListener("change", updateMatch);

        return () => media.removeEventListener("change", updateMatch);
    }, [query]); 

    return matches;
};

export default useMediaQuery;
