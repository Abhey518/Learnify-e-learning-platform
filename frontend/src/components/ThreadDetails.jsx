import React, { useState, useEffect } from 'react';

export default function ThreadDetails({ thread, userId, isInstructor, onBack }) {
    // --- STATE MANAGEMENT ---
    const [replies, setReplies] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE = 'http://127.0.0.1:5000/api/forum';

    // --- FR-4.4: FETCH ALL REPLIES/COMMENTS BELONGING TO THIS SPECIFIC THREAD ---
    const fetchReplies = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/threads/${thread.id}/replies`);
            if (response.ok) {
                const data = await response.json();
                setReplies(data);
            }
        } catch (error) {
            console.error("Error fetching replies:", error);
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch replies as soon as this component screen loads
    useEffect(() => {
        if (thread?.id) {
            fetchReplies();
        }
    }, [thread]);

    // --- FR-4.4: POST A REPLY / COMMENT TO THIS SPECIFIC THREAD ---
    const handlePostReply = async (e) => {
        e.preventDefault();
        if (!content.trim()) return alert("Reply comment cannot be empty!");

        try {
            const response = await fetch(`${API_BASE}/threads/${thread.id}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    user_id: userId
                })
            });

            if (response.ok) {
                setContent(''); // Clear text area inputs on successful reply
                fetchReplies(); // Refresh list to instantly show the new comment/reply
            }
        } catch (error) {
            console.error("Error posting reply:", error);
        }
    };

    // --- FR-4.5: INSTRUCTOR MODERATION TO DELETE INAPPROPRIATE REPLIES ---
    const handleDeleteReply = async (replyId) => {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;

        try {
            const response = await fetch(`${API_BASE}/replies/${replyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchReplies(); // Reload comments stream after successful deletion
            }
        } catch (error) {
            console.error("Error deleting reply:", error);
        }
    };

    return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container">

                {/* DIVISION 1: Back Action Header & Custom Return Navigation Button */}
                <div className="mb-4">
                    <button
                        onClick={onBack}
                        className="btn btn-outline-secondary fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2"
                        style={{ borderRadius: '0.75rem', borderColor: '#dee2e6', color: '#495057' }}
                    >
                        <i className="bi bi-arrow-left"></i> Back to All Discussions
                    </button>
                </div>

                {/* DIVISION 2: Main Focused Thread Question Header Card */}
                <div className="card p-4 border-0 shadow-sm bg-white mb-5" style={{ borderRadius: '1.25rem' }}>
                    <div className="d-flex align-items-start gap-3">
                        <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff' }}>
                            <i className="bi bi-question-circle-fill fs-3" style={{ color: '#6f42c1' }}></i>
                        </div>
                        <div>
                            <h3 className="fw-bold text-dark mb-1">{thread.title}</h3>
                            <p className="text-muted mb-0 fs-6">{thread.description || "No further details description provided."}</p>
                        </div>
                    </div>
                </div>

                <div className="row g-4">

                    {/* DIVISION 3: Comments Feed / Existing Replies Section Stream (FR-4.4) */}
                    <div className="col-lg-8">
                        <h5 className="fw-bold text-dark mb-3">Discussion Feed ({replies.length} Responses)</h5>

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" style={{ color: '#6f42c1' }} role="status"></div>
                            </div>
                        ) : replies.length === 0 ? (
                            <div className="card p-4 border-0 text-center bg-white" style={{ borderRadius: '1.25rem' }}>
                                <p className="text-muted mb-0 small">No responses yet. Start the conversation below!</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className="card p-4 border-0 shadow-sm bg-white position-relative"
                                        style={{ borderRadius: '1.25rem' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="w-100">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="bi bi-person-circle fs-5 text-secondary"></i>
                                                    <span className="fw-semibold text-dark small">User #{reply.user_id}</span>
                                                </div>
                                                <p className="text-dark mb-0 fs-6" style={{ whiteSpace: 'pre-line' }}>{reply.content}</p>
                                            </div>

                                            {/* --- FR-4.5: INSTRUCTOR DELETION BUTTON IF INAPPROPRIATE --- */}
                                            {isInstructor && (
                                                <button
                                                    className="btn btn-link text-danger p-1 ms-2"
                                                    onClick={() => handleDeleteReply(reply.id)}
                                                    title="Delete Inappropriate Comment"
                                                >
                                                    <i className="bi bi-trash3 fs-6"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DIVISION 4: Reply Editor Box Container Form (FR-4.4) */}
                    <div className="col-lg-4">
                        <div className="card p-4 shadow-sm border-0 bg-white sticky-top" style={{ borderRadius: '1.25rem', top: '20px' }}>
                            <h5 className="fw-bold text-dark mb-3">Contribute a Reply</h5>
                            <form onSubmit={handlePostReply}>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-semibold">YOUR RESPONSE</label>
                                    <textarea
                                        className="form-control px-3 py-2"
                                        style={{ borderRadius: '0.5rem' }}
                                        rows="5"
                                        placeholder="Type your helpful comment or answer explanation..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn text-white fw-semibold w-100 py-2.5 shadow-sm"
                                    style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}
                                >
                                    Submit Comment
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}