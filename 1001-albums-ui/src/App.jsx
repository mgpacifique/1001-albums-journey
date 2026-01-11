import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Stats from './components/Stats';
import Sidebar from './components/Sidebar';
import { getProject } from './api';

import './App.css';

// Wrapper to fetch project data once and pass to children
function ProjectLayout({ projectId, onLogout, musicPlatform, onTogglePlatform }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProject(projectId)
      .then(res => {
        // Flatten history items: { album: {...}, ... } -> { ...album, ...rest }
        if (res.history) {
          res.history = res.history.map(item => ({
            ...item.album, // Puts name, images, artist at top level
            ...item        // Puts rating, generatedAt at top level
          }));
        }
        setData(res);
      })
      .catch(err => setError(err.message));
  }, [projectId]);

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#fff' }}>
        <h2>Error loading project</h2>
        <p>{error}</p>
        <button onClick={onLogout} style={{ marginTop: '1rem', padding: '0.5rem' }}>Back to Login</button>
      </div>
    )
  }

  if (!data) return <div style={{ color: '#fff', padding: '2rem' }}>Loading project...</div>;

  return (
    <div className="main-layout">
      <Sidebar onLogout={onLogout} />
      <div className="content-area">
        <Routes>
          <Route path="/" element={
            <Dashboard
              data={data}
              musicPlatform={musicPlatform}
              onTogglePlatform={onTogglePlatform}
            />
          } />

          <Route path="/history" element={
            <div className="container animate-fade-in">
              <h1>Full History</h1>
              <History history={data.history} musicPlatform={musicPlatform} />
            </div>
          } />

          <Route path="/stats" element={
            <Stats history={data.history} />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [projectId, setProjectId] = useState(null);
  const [musicPlatform, setMusicPlatform] = useState('spotify'); // 'spotify' or 'apple'

  useEffect(() => {
    const savedId = localStorage.getItem('1001_project_id');
    const savedPlatform = localStorage.getItem('1001_music_platform');
    if (savedId) setProjectId(savedId);
    if (savedPlatform) setMusicPlatform(savedPlatform);
  }, []);

  const handleSetProject = (id) => {
    localStorage.setItem('1001_project_id', id);
    setProjectId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('1001_project_id');
    setProjectId(null);
  };

  const togglePlatform = () => {
    const newPlatform = musicPlatform === 'spotify' ? 'apple' : 'spotify';
    setMusicPlatform(newPlatform);
    localStorage.setItem('1001_music_platform', newPlatform);
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        {projectId ? (
          <ProjectLayout
            projectId={projectId}
            onLogout={handleLogout}
            musicPlatform={musicPlatform}
            onTogglePlatform={togglePlatform}
          />
        ) : (
          <Onboarding onProjectSet={handleSetProject} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
