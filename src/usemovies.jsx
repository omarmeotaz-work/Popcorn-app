import { useState, useEffect } from "react";
const KEY = "d6e9ca3";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [isError, setIsError] = useState("");

  useEffect(
    function () {
      callback?.();
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsloading(true);
          setIsError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}}
            `,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("something went wrong with fetching the movies");

          const data = await res.json();

          if (data.Response === "False") throw new Error("movie not found");

          setMovies(data.Search);
          setIsloading(false);
        } catch (err) {
          if (err.name !== "AbortError") {
            setIsError(err.message);
          }
        } finally {
          setIsloading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setIsError("");
        return;
      }
      //   handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, isError };
}
