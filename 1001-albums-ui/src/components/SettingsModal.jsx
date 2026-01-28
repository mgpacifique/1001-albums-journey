import React from 'react';
import { X, Globe, AppWindow, Music } from 'lucide-react';
import { PLATFORMS, MODES, getPlatformConfig } from '../utils/streaming';
import './SettingsModal.css';

export default function SettingsModal({
    isOpen,
    onClose,
    currentPlatform,
    setPlatform,
    currentMode,
    setMode
}) {
    if (!isOpen) return null;

    const platforms = Object.values(PLATFORMS);

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h2><Music /> Streaming Preferences</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="settings-content">
                    {/* Platform Selection */}
                    <div className="mode-section">
                        <h3>Choose your Service</h3>
                        <div className="platform-grid">
                            {platforms.map(p => {
                                const config = getPlatformConfig(p);
                                return (
                                    <button
                                        key={p}
                                        className={`platform-option ${currentPlatform === p ? 'active' : ''}`}
                                        onClick={() => setPlatform(p)}
                                    >
                                        <div
                                            className="p-icon"
                                            style={{ backgroundColor: config.color }}
                                        ></div>
                                        <span>{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="mode-section">
                        <h3>Playback Mode</h3>
                        <div className="mode-toggle-group">
                            <button
                                className={`mode-btn ${currentMode === MODES.WEB ? 'active' : ''}`}
                                onClick={() => setMode(MODES.WEB)}
                            >
                                <Globe size={16} style={{ marginBottom: '-2px', marginRight: '6px' }} />
                                Web Player
                            </button>
                            <button
                                className={`mode-btn ${currentMode === MODES.APP ? 'active' : ''}`}
                                onClick={() => setMode(MODES.APP)}
                            >
                                <AppWindow size={16} style={{ marginBottom: '-2px', marginRight: '6px' }} />
                                Desktop App
                            </button>
                        </div>
                        <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#71717a' }}>
                            "Desktop App" tries to open your installed app directly. "Web Player" opens the browser version.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
