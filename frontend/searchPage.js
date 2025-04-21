import { useState } from 'react';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/search?q=${query}`);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-container">
            <h2>Search</h2>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for pins, boards, or users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit">Search</button>
            </form>
            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}
            <div className="search-results">
                {results.length > 0 && results.map((item) => (
                    <div key={item._id} className="search-result-item">
                        <h3>{item.title || item.name}</h3>
                        {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;