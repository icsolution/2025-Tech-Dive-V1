import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BoardDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        const fetchBoardDetails = async () => {
            try {
                const response = await fetch(`/api/boards/${id}`);
                if (!response.ok) throw new Error('Failed to fetch board details');
                const data = await response.json();
                setBoard(data);
                setFormData({ name: data.name, description: data.description });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBoardDetails();
    }, [id]);

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to update board');
            const data = await response.json();
            setBoard(data);
            setEditMode(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete board');
            navigate('/boards');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddPin = async (pinId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}/add-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pinId }),
            });
            if (!response.ok) throw new Error('Failed to add pin');
            const data = await response.json();
            setBoard(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemovePin = async (pinId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}/remove-pin/${pinId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to remove pin');
            const data = await response.json();
            setBoard(data);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
    if (error) return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {board && (
                <>
                    {editMode ? (
                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                name="name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Board Name"
                            />
                            <TextInput
                                style={styles.input}
                                name="description"
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Board Description"
                                multiline
                            />
                            <TouchableOpacity style={styles.button} onPress={handleEdit}>
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.title}>{board.name}</Text>
                            <Text style={styles.description}>{board.description}</Text>
                            <View style={styles.metadataContainer}>
                                <View style={styles.metadataItem}>
                                    <MaterialCommunityIcons 
                                        name={board.isPrivate ? "lock" : "lock-open"} 
                                        size={16} 
                                        color="#666" 
                                    />
                                    <Text style={styles.metadataText}>
                                        {board.isPrivate ? "Private" : "Public"}
                                    </Text>
                                </View>
                                <View style={styles.metadataItem}>
                                    <MaterialCommunityIcons 
                                        name="account-group" 
                                        size={16} 
                                        color="#666" 
                                    />
                                    <Text style={styles.metadataText}>
                                        {board.collaborators?.length || 0} Collaborators
                                    </Text>
                                </View>
                                <View style={styles.metadataItem}>
                                    <MaterialCommunityIcons 
                                        name="calendar" 
                                        size={16} 
                                        color="#666" 
                                    />
                                    <Text style={styles.metadataText}>
                                        Created {new Date(board.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.editButton]} 
                                    onPress={() => setEditMode(true)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.button, styles.deleteButton]} 
                                    onPress={handleDelete}
                                >
                                    <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                    <View style={styles.pinsGrid}>
                        {board.pins.map(pin => (
                            <View key={pin._id} style={styles.pinCard}>
                                <Image 
                                    source={{ uri: pin.imageUrl }} 
                                    style={styles.pinImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.pinTitle}>{pin.title}</Text>
                                <TouchableOpacity 
                                    style={[styles.button, styles.removeButton]}
                                    onPress={() => handleRemovePin(pin._id)}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Remove from Board</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#007AFF',
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
    form: {
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    pinsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    pinCard: {
        width: '48%',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        overflow: 'hidden',
    },
    pinImage: {
        width: '100%',
        height: 200,
    },
    pinTitle: {
        padding: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    metadataContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metadataText: {
        fontSize: 14,
        color: '#666',
    },
});

export default BoardDetailPage;
