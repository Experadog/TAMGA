import { useEffect, useRef, useState } from "react";

export const useFetch = (url) => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const abortController = useRef(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setIsError(false);
      
      abortController.current?.abort();
      abortController.current = new AbortController();

      try {
        const response = await fetch(url, {
          signal: abortController.current.signal,
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
            return;
        }

        console.error("Error fetching data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [url]);

  return { data, isLoading, isError };
};
