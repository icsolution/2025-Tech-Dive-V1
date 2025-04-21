import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const logout = () => {
    localStorage.removeItem('token');
    fetch('/api/auth/logout', { method: 'POST' }); // Logout API call
    window.location.href = '/login';
};

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Unauthorized');
                const data = await response.json();
                setUser(data);
            } catch (error) {
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    return { user, loading };
};