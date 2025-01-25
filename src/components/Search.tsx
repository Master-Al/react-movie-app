interface IMovieProviderProps {
  searchTerm: string | undefined;
  setSearchTerm: (searchTerm: string) => void;
}

const Search = ({ searchTerm, setSearchTerm }: IMovieProviderProps) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />

        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
