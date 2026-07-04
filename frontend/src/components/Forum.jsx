import React, { useState } from 'react';
import ForumThreads from './ForumThreads';
import ThreadDetails from './ThreadDetails';

export default function Forum({ courseId, userId, isInstructor }) {
    // --- STATE MANAGEMENT ---
    // Controls which view to display: 'threads' (list) or 'details' (single thread responses)
    const [activeView, setActiveView] = useState('threads');
    const [selectedThread, setSelectedThread] = useState(null);

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

    return (
        <div className="forum-system-container">
            {/* 
        DIVISION 1: Dynamic Route Switcher
        Toggles components cleanly based on state without reloading the page
      */}
            {activeView === 'threads' ? (
                <ForumThreads
                    courseId={courseId}
                    userId={userId}
                    isInstructor={isInstructor}
                    onSelectThread={handleSelectThread}
                />
            ) : (
                <ThreadDetails
                    thread={selectedThread}
                    userId={userId}
                    isInstructor={isInstructor}
                    onBack={handleBackToThreads}
                />
            )}
        </div>
    );
}