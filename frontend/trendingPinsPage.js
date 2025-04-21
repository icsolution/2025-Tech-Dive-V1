import { useState, useEffect } from 'react';

const TrendingPinsPage = () => {
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrendingPins = async () => {
            try {
                const response = await fetch('/api/trending');
                if (!response.ok) throw new Error('Failed to fetch trending pins');
                const data = await response.json();
                setPins(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTrendingPins();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="trending-pins-container">
            <h2>Trending Pins</h2>
            <div className="pins-grid">
                {pins.map(pin => (
                    <div key={pin._id} className="pin-card">
                        <img src={pin.imageUrl} alt={pin.title} />
                        <h3>{pin.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingPinsPage;
