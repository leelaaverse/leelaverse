import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import MainContent from '../MainContent/MainContent';
import FloatingBar from '../FloatingBar/FloatingBar';
import Sidebar from '../Sidebar/Sidebar';
import './HomeFeed.css';

const HomeFeed = () => {
    const [activeTab, setActiveTab] = useState('featured');

    return (
        <div className="home-feed">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <MainContent activeTab={activeTab} />
            <FloatingBar />
            <Sidebar />
        </div>
    );
};

export default HomeFeed;
