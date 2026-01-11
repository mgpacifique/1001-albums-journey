import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, LogOut, Disc } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onLogout }) {
    return (
        <nav className="sidebar glass-panel">
            <div className="sidebar-header">
                <Disc size={32} className="logo-icon spin-slow" />
                <span className="logo-text">1001 Daily</span>
            </div>

            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <History size={20} />
                    <span>History</span>
                </NavLink>

                <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <BarChart3 size={20} />
                    <span>Stats</span>
                </NavLink>
            </div>

            <div className="sidebar-footer">
                <button onClick={onLogout} className="nav-item logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}
