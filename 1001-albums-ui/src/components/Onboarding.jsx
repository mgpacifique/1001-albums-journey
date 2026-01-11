import React, { useState } from 'react';
import './Onboarding.css';

export default function Onboarding({ onProjectSet }) {
    const [projectId, setProjectId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (projectId.trim()) {
            onProjectSet(projectId.trim());
        }
    };

    return (
        <div className="onboarding-container glass-panel animate-fade-in">
            <h1>1001 Albums Daily</h1>
            <p className="subtitle">Enter your project ID to start tracking.</p>

            <form onSubmit={handleSubmit} className="onboarding-form">
                <input
                    type="text"
                    placeholder="e.g. your-project-name"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="project-input"
                />
                <p className="input-hint">
                    Find this in your URL: 1001albumsgenerator.com/<strong>project-id</strong>
                </p>
                <button type="submit" className="start-btn">Connect Project</button>
            </form>

            <div className="help-text">
                <p>Don't have a project?</p>
                <a
                    href="https://1001albumsgenerator.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Generate one here
                </a>
            </div>
        </div>
    );
}
