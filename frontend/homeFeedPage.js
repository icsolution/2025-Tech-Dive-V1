import { useState, useEffect } from 'react';

const HomeFeed = () => {
    const [pins, setPins] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPins = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/pins?page=${page}&limit=10`);
                if (!response.ok) throw new Error('Failed to fetch pins');
                const data = await response.json();
                setPins(prevPins => [...prevPins, ...data]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPins();
    }, [page]);

    const loadMore = () => setPage(prevPage => prevPage + 1);

    return (
        <div className="home-feed-container">
            <h2>Home Feed</h2>
            {error && <p className="error">{error}</p>}
            <div className="pins-grid">
                {pins.map(pin => (
                    <div key={pin._id} className="pin-card">
                        <img src={pin.imageUrl} alt={pin.title} />
                        <h3>{pin.title}</h3>
                    </div>
                ))}
            </div>
            {loading && <p>Loading...</p>}
            {!loading && <button onClick={loadMore}>Load More</button>}
        </div>
    );
};

export default HomeFeed;