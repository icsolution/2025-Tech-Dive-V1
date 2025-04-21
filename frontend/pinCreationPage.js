import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PinCreationPage = () => {
    const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', boardId: '' });
    const [boards, setBoards] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            }
        };
        fetchBoards();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create pin');
            }
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="pin-creation-container">
            <h2>Create a New Pin</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="imageUrl"
                    placeholder="Image URL"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                />
                <select name="boardId" value={formData.boardId} onChange={handleChange} required>
                    <option value="">Select a Board</option>
                    {boards.map(board => (
                        <option key={board._id} value={board._id}>{board.name}</option>
                    ))}
                </select>
                <button type="submit">Create Pin</button>
            </form>
        </div>
    );
};

export default PinCreationPage;