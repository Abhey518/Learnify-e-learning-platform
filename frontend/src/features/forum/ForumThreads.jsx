import React, { useState, useEffect } from 'react';

 // Added useNavigate 
import { useNavigate } from 'react-router-dom';

export default function ForumThreads({ courseId, userId, isInstructor, onSelectThread }) {
    // --- STATE MANAGEMENT ---
    const [threads, setThreads] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/forum';

    // Add this block inside the ForumThreads component:
    const navigate = useNavigate();
    // Helper to redirect users based on their role
    const handleBackToCourse = () => {
        if (isInstructor) {
            navigate('/dashboards/instructor');
        } else {
            navigate(`/courses/${courseId}/learning`);
        }
    };

    // --- FR-4.3: FETCH ALL DISCUSSION THREADS FROM BACKEND ---
    const fetchThreads = async () => {
        setLoading(true);
        try {
            // Passes courseId as a query parameter to restrict visibility to this specific course (FR-4.1)
            const response = await fetch(`${API_BASE}/${courseId}/threads`, {credentials: 'include'});
            console.log(response)
            if (response.ok) {
                const data = await response.json();

                // Safely set threads if it's an array
                if (Array.isArray(data)) {
                    setThreads(data);
                } else {
                    setThreads([]);
                }
                // setThreads(data);
            }
        } catch (error) {
            console.error("Error fetching threads:", error);
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch threads whenever the courseId changes
    useEffect(() => {
        if (courseId) {
            fetchThreads();
        }
    }, [courseId]);

    // --- FR-4.2: CREATE NEW DISCUSSION THREAD LOGIC ---
    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (!title.trim()) return alert("Please provide a thread title.");

        // Added description check
        if (!description.trim()) return alert("Please provide a detailed description."); 

        try {
            const response = await fetch(`${API_BASE}/threads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: title,
                    description: description,
                    course_id: courseId,
                    user_id: userId
                })
            });

            if (response.ok) {
                setTitle('');       // Clear form input fields on success
                setDescription('');
                fetchThreads();     // Refresh list to instantly show the new thread
            }
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    // --- FR-4.5: INSTRUCTOR OPTIONAL MODERATION DELETION ---
    const handleDeleteThread = async (threadId, e) => {
        e.stopPropagation(); // Prevents clicking the delete button from accidentally triggering "View Replies"
        if (!window.confirm("Are you sure you want to delete this thread?")) return;

        try {
            const response = await fetch(`${API_BASE}/threads/${threadId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                fetchThreads(); // Reload thread list after successful deletion
            }
        } catch (error) {
            console.error("Error deleting thread:", error);
        }
    };

   
    return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container">
                {/* --- NAVIGATION: Back to Course Workspace / Dashboard --- */}
                <div className="mb-4">
                    <button
                        onClick={handleBackToCourse}
                        className="btn btn-outline-secondary fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2"
                        style={{ borderRadius: '0.75rem', borderColor: '#dee2e6', color: '#495057' }}
                    >
                        <i className="bi bi-arrow-left"></i> {isInstructor ? 'Back to Dashboard' : 'Back to Course'}
                    </button>
                </div>

                {/* DIVISION 1: Forum Header Banner */}
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', width: '70px', height: '70px' }}>
                        <i className="bi bi-chat-left-text-fill fs-2" style={{ color: '#6f42c1' }}></i>
                    </div>
                    <div>
                        <h1 className="h2 fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Course Discussion Forum</h1>
                        <p className="text-muted mb-0">Clear your doubts, collaborate, and learn from fellow students.</p>
                    </div>
                </div>

                <div className="row g-4">

                    {/* DIVISION 2: Thread Creation Form Box (FR-4.2) */}
                    <div className="col-lg-4">
                        <div className="card p-4 shadow-sm border-0 bg-white sticky-top" style={{ borderRadius: '1.25rem', top: '20px' }}>
                            <h5 className="fw-bold text-dark mb-3">Ask a New Doubt</h5>
                            <form onSubmit={handleCreateThread}>

                                {/* ------------------- */}
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-semibold">THREAD TITLE</label>
                                    <input
                                        type="text"
                                        className="form-control px-3 py-2"
                                        style={{ borderRadius: '0.5rem' }}
                                        placeholder="Enter the title of your question..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-semibold">DESCRIPTION</label>
                                    <textarea
                                        className="form-control px-3 py-2"
                                        style={{ borderRadius: '0.5rem' }}
                                        rows="4"
                                        placeholder="Provide details about your question..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn text-white fw-semibold w-100 py-2.5 shadow-sm"
                                    style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}
                                >
                                    Post to Forum
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* DIVISION 3: Active Discussions Threads Feed Grid (FR-4.3) */}
                    <div className="col-lg-8">
                        <h4 className="fw-bold text-dark mb-3">Active Discussions</h4>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#6f42c1' }} role="status"></div>
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="card p-5 border-0 text-center bg-white" style={{ borderRadius: '1.25rem' }}>
                                <p className="text-muted mb-0">No discussions yet in this course. Be the first one to ask a doubt!</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {threads.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="card p-4 border-0 shadow-sm bg-white position-relative forum-thread-card"
                                        style={{ borderRadius: '1.25rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        onClick={() => onSelectThread(thread)}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className='w-100'>
                                                {/* User Profile Header (Top of Thread Card) */}
                                                <div className='d-flex align-items-center gap-2 mb-2'>
                                                    <i className="bi bi-person-circle fs-5 text-secondary"></i>
                                                    <span className="fw-semibold text-dark small">
                                                        {thread.profiles?.name || `User #${thread.user_id}`} 
                                                    </span>
                                                    {thread.profiles?.role && (
                                                        <span className={`badge rounded-pill text-capitalize ${
                                                            thread.profiles.role === 'instructor' ? 'bg-success' : 'bg-primary'
                                                            }`} style={{ fontSize: '0.7rem' }}> 
                                                            {thread.profiles.role}
                                                        </span>
                                                    )}
                                                </div>
                                                <h5 className="fw-bold text-dark mb-1">{thread.title}</h5>
                                                <p className="text-muted mb-3 small">{thread.description || "No description provided."}</p>
                                                <span className="badge px-3 py-2 text-decoration-none fw-semibold" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1', borderRadius: '0.5rem' }}>
                                                    View Replies 💬
                                                </span>
                                            </div>

                                            {/* --- FR-4.5: INSTRUCTOR ONLY DELETE ACTION BUTTON --- */}
                                            {isInstructor && (
                                                <button
                                                    className="btn btn-link text-danger p-1"
                                                    onClick={(e) => handleDeleteThread(thread.id, e)}
                                                    title="Delete Inappropriate Thread"
                                                >
                                                    <i className="bi bi-trash3 fs-5"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}