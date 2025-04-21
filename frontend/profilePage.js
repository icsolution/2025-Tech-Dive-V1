import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`/api/users/${id}`);
                if (!response.ok) throw new Error('Failed to fetch user profile');
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="profile-container">
            {user && (
                <>
                    <img src={user.avatar} alt={`${user.username}'s avatar`} className="profile-avatar" />
                    <h2>{user.username}</h2>
                    <p>{user.bio}</p>
                    <p>Email: {user.email}</p>
                </>
            )}
        </div>
    );
};

export default ProfilePage;
