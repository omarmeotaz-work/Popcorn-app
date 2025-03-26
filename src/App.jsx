import { useEffect, useRef, useState } from "react";
import React from "react";
import ReactDom from "react-dom/client";
import "./index.css";
import "./App.css";
import Rating from "./assets/rating";
import { useMovies } from "./usemovies";
import { useLocalState } from "./useLocalState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

const Search = ({ query, setQuery }) => {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
};
const Results = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
};

const Navbar = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};

const MovieList = ({ movies, onSelectedMovie }) => {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <li onClick={() => onSelectedMovie(movie.imdbID)} key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

const Summary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Math.round(avgImdbRating, 2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.round(avgUserRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
};

const WatchedMovie = ({ movie, onremove }) => {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onremove(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
};

const WatchedList = ({ watched, onremove }) => {
  return (
    <ul className="list">
      {watched.map((movie, index) => (
        <WatchedMovie movie={movie} key={index} onremove={onremove} />
      ))}
    </ul>
  );
};
const SelectedMovie = ({ selectId, onCloseMovie, onAddWatch, watched }) => {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsloading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Genre: genre,
    Plot: plot,
    Actors: actors,
    Director: director,
    imdbRating: imdbRating,
  } = movie;

  function handleAdd() {
    const newMovie = {
      imdbID: selectId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      genre,
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAddWatch(newMovie);
    onCloseMovie();
  }

  useKey("escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsloading(true);
        const res =
          await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectId}
  `);
        const data = await res.json();
        setMovie(data);
        setIsloading(false);
      }
      getMovieDetails();
    },
    [selectId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopCorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {year} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <Rating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}{" "}
                </>
              ) : (
                <p>You rated this movie {watchedUserRating}⭐ </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by: {director}</p>
          </section>
        </>
      )}
    </div>
  );
};

const Loader = () => {
  return <p className="loader">Loading...</p>;
};
const ErrorMessage = ({ message }) => {
  return <p className="error">{message}</p>;
};

const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};
const KEY = "d6e9ca3";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectId, setSelectedId] = useState(null);

  const { movies, isLoading, isError } = useMovies(query, handleCloseMovie);
  const [watched, setWatched] = useLocalState([], "watched");

  function handleSelectedMovie(id) {
    setSelectedId(id);
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleRemoveWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Navbar movies={movies}>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !isError && (
            <MovieList movies={movies} onSelectedMovie={handleSelectedMovie} />
          )}
          {isError && <ErrorMessage message={isError} />}
        </Box>
        <Box>
          {selectId ? (
            <SelectedMovie
              selectId={selectId}
              onCloseMovie={handleCloseMovie}
              onAddWatch={handleAddWatch}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedList watched={watched} onremove={handleRemoveWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
