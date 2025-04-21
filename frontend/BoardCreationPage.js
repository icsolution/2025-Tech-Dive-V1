import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BoardCreationPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create board');
            navigate('/boards');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="board-creation-container">
            <h2>Create a New Board</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Board Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Board Description"
                    value={formData.description}
                    onChange={handleChange}
                />
                <button type="submit">Create Board</button>
            </form>
        </div>
    );
};

export default BoardCreationPage;
