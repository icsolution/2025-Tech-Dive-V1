import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserBoardsProfilePage = () => {
    const { id } = useParams();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserBoards = async () => {
            try {
                const response = await fetch(`/api/users/${id}/boards`);
                if (!response.ok) throw new Error('Failed to fetch user boards');
                const data = await response.json();
                setBoards(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserBoards();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="user-boards-container">
            <h2>User's Boards</h2>
            <div className="boards-grid">
                {boards.map(board => (
                    <div key={board._id} className="board-card">
                        <h3>{board.name}</h3>
                        <p>{board.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserBoardsProfilePage;
