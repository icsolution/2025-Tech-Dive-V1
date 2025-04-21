import { useState, useEffect } from 'react';

const UserBoardsPage = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/boards', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch boards');
                const data = await response.json();
                setBoards(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBoards();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="user-boards-container">
            <h2>Your Boards</h2>
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

export default UserBoardsPage;
