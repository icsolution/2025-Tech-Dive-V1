import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PinDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pin, setPin] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', boardId: '' });
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchPinDetails = async () => {
            try {
                const response = await fetch(`/api/pins/${id}`);
                if (!response.ok) throw new Error('Failed to fetch pin details');
                const data = await response.json();
                setPin(data);
                setFormData({ title: data.title, description: data.description, boardId: data.board });
                setLiked(data.likes?.includes(localStorage.getItem('userId')));
                setSaved(data.savedBy?.includes(localStorage.getItem('userId')));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/pins/${id}/comments`);
                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPinDetails();
        fetchComments();
    }, [id]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pins/${id}/${liked ? 'unlike' : 'like'}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to update like status');
            setLiked(!liked);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pins/${id}/${saved ? 'unsave' : 'save'}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to update save status');
            setSaved(!saved);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pins/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: newComment }),
            });
            if (!response.ok) throw new Error('Failed to add comment');
            const data = await response.json();
            setComments([...comments, data]);
            setNewComment('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete comment');
            setComments(comments.filter(comment => comment._id !== commentId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="pin-detail-container">
            {pin && (
                <>
                    <img src={pin.imageUrl} alt={pin.title} />
                    <h2>{pin.title}</h2>
                    <p>{pin.description}</p>
                    <button onClick={handleLike}>{liked ? 'Unlike' : 'Like'}</button>
                    <button onClick={handleSave}>{saved ? 'Unsave' : 'Save'}</button>
                    <h3>Comments</h3>
                    <form onSubmit={handleCommentSubmit}>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                        />
                        <button type="submit">Post</button>
                    </form>
                    <ul>
                        {comments.map(comment => (
                            <li key={comment._id}>
                                {comment.text} - {comment.user.username}
                                <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default PinDetailPage;
