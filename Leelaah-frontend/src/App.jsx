import React, { useState } from 'react';
import HomeFeed from './components/HomeFeed/HomeFeed';
import ViewProfile from './components/ViewProfile/ViewProfile';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'profile'

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="App">
      {currentView === 'home' ? (
        <HomeFeed onNavigate={handleNavigate} />
      ) : (
        <ViewProfile onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
