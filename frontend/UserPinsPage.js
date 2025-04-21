import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserPinsPage = () => {
    const { id } = useParams();
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserPins = async () => {
            try {
                const response = await fetch(`/api/users/${id}/pins`);
                if (!response.ok) throw new Error('Failed to fetch user pins');
                const data = await response.json();
                setPins(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserPins();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="user-pins-container">
            <h2>User's Pins</h2>
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

export default UserPinsPage;
