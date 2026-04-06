import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../../store/slices/themeSlice';
import { FiSun, FiMoon, FiMonitor, FiGlobe, FiHelpCircle, FiShield, FiExternalLink, FiChevronRight, FiBell, FiLock } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import './Settings.css';

const Settings = ({ onBack, onNavigate }) => {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');

    const handleThemeChange = (newTheme) => {
        dispatch(setTheme(newTheme));
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const themeOptions = [
        { value: 'Light', label: 'Light', icon: <FiSun size={16} /> },
        { value: 'Dark', label: 'Dark', icon: <FiMoon size={16} /> },
        { value: 'Auto', label: 'System', icon: <FiMonitor size={16} /> },
    ];

    return (
        <div className="settings-page">
            <Navbar isLoggedIn={true} onBack={onBack} showBackButton={true} onNavigate={onNavigate} />

            <div className="settings-container">
                <div className="settings-header">
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-subtitle">Manage your account and preferences</p>
                </div>

                {/* Appearance Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">Appearance</h3>
                    <div className="settings-card">
                        <div className="settings-row">
                            <div className="settings-row-left">
                                <FiSun size={18} className="settings-icon" />
                                <div>
                                    <p className="settings-row-title">Theme</p>
                                    <p className="settings-row-desc">Choose your preferred appearance</p>
                                </div>
                            </div>
                        </div>
                        <div className="theme-selector">
                            {themeOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleThemeChange(opt.value)}
                                    className={`theme-btn ${theme === opt.value ? 'active' : ''}`}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Language Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">Language & Region</h3>
                    <div className="settings-card">
                        <div className="settings-row clickable">
                            <div className="settings-row-left">
                                <FiGlobe size={18} className="settings-icon" />
                                <div>
                                    <p className="settings-row-title">Display Language</p>
                                    <p className="settings-row-desc">Set the language for the interface</p>
                                </div>
                            </div>
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                className="settings-select"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Spanish">Spanish</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">Notifications</h3>
                    <div className="settings-card">
                        <button className="settings-row clickable">
                            <div className="settings-row-left">
                                <FiBell size={18} className="settings-icon" />
                                <div>
                                    <p className="settings-row-title">Push Notifications</p>
                                    <p className="settings-row-desc">Manage what notifications you receive</p>
                                </div>
                            </div>
                            <FiChevronRight size={16} className="settings-chevron" />
                        </button>
                    </div>
                </div>

                {/* Security Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">Security & Privacy</h3>
                    <div className="settings-card">
                        <button className="settings-row clickable card-row-border">
                            <div className="settings-row-left">
                                <FiLock size={18} className="settings-icon" />
                                <div>
                                    <p className="settings-row-title">Password & Security</p>
                                    <p className="settings-row-desc">Update password and login settings</p>
                                </div>
                            </div>
                            <FiChevronRight size={16} className="settings-chevron" />
                        </button>
                        <button className="settings-row clickable">
                            <div className="settings-row-left">
                                <FiShield size={18} className="settings-icon" />
                                <div>
                                    <p className="settings-row-title">Account Privacy</p>
                                    <p className="settings-row-desc">Control who can see your content</p>
                                </div>
                            </div>
                            <FiChevronRight size={16} className="settings-chevron" />
                        </button>
                    </div>
                </div>

                {/* Support Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">Support</h3>
                    <div className="settings-card">
                        <button className="settings-row clickable card-row-border">
                            <div className="settings-row-left">
                                <FiHelpCircle size={18} className="settings-icon" />
                                <div>
                                    <p className="settings-row-title">Help & Support</p>
                                    <p className="settings-row-desc">FAQs, contact us, and troubleshooting</p>
                                </div>
                            </div>
                            <FiChevronRight size={16} className="settings-chevron" />
                        </button>
                        <a
                            href="https://discord.gg/leelaah"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="settings-row clickable"
                        >
                            <div className="settings-row-left">
                                <FaDiscord size={18} className="settings-icon-discord" />
                                <div>
                                    <p className="settings-row-title">Join our Discord</p>
                                    <p className="settings-row-desc">Chat with the community & get updates</p>
                                </div>
                            </div>
                            <FiExternalLink size={14} className="settings-chevron" />
                        </a>
                    </div>
                </div>

                <p className="settings-footer">Leelaah v1.0 • Made with ❤️</p>
            </div>
        </div>
    );
};

export default Settings;
