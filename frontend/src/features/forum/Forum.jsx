import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ForumThreads from './ForumThreads';
import ThreadDetails from './ThreadDetails';

export default function Forum() {

    const { courseId } = useParams();
    
    // --- STATE MANAGEMENT ---
    // Controls which view to display: 'threads' (list) or 'details' (single thread responses)
    const [activeView, setActiveView] = useState('threads');
    const [selectedThread, setSelectedThread] = useState(null);
    const [user, setUser] = useState({ userId: null, isInstructor: false });
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_URL || '/api';

     // --- FETCH USER CONTEXT ---
    useEffect(() => {
        fetch(`${baseUrl}/auth/current-user`, { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error("Unauthenticated");
                return res.json();
            })
            .then((data) => {
                if (data && data.logged_in) {
                    setUser({
                        userId: data.user_id,
                        isInstructor: data.role === 'instructor'
                    });
                }
            })
            .catch((err) => console.error("Error fetching user session:", err))
            .finally(() => setLoading(false));
    }, []);


    // --- NAVIGATION ACTION: GO TO THREAD DETAILS VIEW ---
    const handleSelectThread = (thread) => {
        setSelectedThread(thread);
        setActiveView('details');
    };

    // --- NAVIGATION ACTION: RETURN BACK TO THREADS LIST FEED ---
    const handleBackToThreads = () => {
        setSelectedThread(null);
        setActiveView('threads');
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border" style={{ color: '#6f42c1' }} role="status">
                    <span className="visually-hidden">Loading Forum Context...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="forum-system-container">
            {activeView === 'threads' ? (
                <ForumThreads
                    courseId={courseId}
                    userId={user.userId}
                    isInstructor={user.isInstructor}
                    onSelectThread={handleSelectThread}
                />
            ) : (
                <ThreadDetails
                    thread={selectedThread}
                    userId={user.userId}
                    isInstructor={user.isInstructor}
                    onBack={handleBackToThreads}
                />
            )}
        </div>
    );
}