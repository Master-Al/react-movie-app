import { useState, useEffect } from "react";
import Search from "./components/Search";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { Helmet } from "react-helmet";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_IMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [movieList, setMovieList] = useState<any[]>([]);

  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
  const fetchMovies = async (query: string = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async (): Promise<void> => {
    try {
      const movies: any = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <Helmet>
        <title>My Movie App</title>
        <meta
          name="description"
          content="A movie app built with React TS and Vite"
        />
        <meta name="keywords" content="movies, react, vite, app" />
        <meta name="author" content="Master-Al" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Fafa_Al22" />
        <meta name="twitter:creator" content="@Fafa_Al22" />
        <meta name="twitter:image" content="/card.png" />
        <meta property="og:site_name" content="Movie App" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/hero.png" />
      </Helmet>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
