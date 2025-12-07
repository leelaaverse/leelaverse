import React, { useState, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import HomeFeed from './components/HomeFeed/HomeFeed';
import ViewProfile from './components/ViewProfile/ViewProfile';
import UserProfile from './components/UserProfile/UserProfile';
import SinglePost from './components/SinglePost/SinglePost';
import Bloops from './components/Bloops/Bloops';
import AuthModal from './components/AuthModal/AuthModal';
import { setAuth } from './store/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'profile', 'user', or 'post'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleNavigate = (view, data = null) => {
    if (view === 'post' && data) {
      setSelectedPostId(data);
    }
    if (view === 'user' && data) {
      // If navigating to own profile, go to ViewProfile instead
      if (user && data === user.id) {
        setCurrentView('profile');
        return;
      }
      setSelectedUserId(data);
    }
    setCurrentView(view);
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setCurrentView('post');
  };

  const handleUserClick = (userId) => {
    // If clicking on own profile, go to ViewProfile
    if (user && userId === user.id) {
      setCurrentView('profile');
      return;
    }
    setSelectedUserId(userId);
    setCurrentView('user');
  };

  const handleBackFromPost = () => {
    setSelectedPostId(null);
    setCurrentView('home');
  };

  const handleBackFromUser = () => {
    setSelectedUserId(null);
    setCurrentView('home');
  };

  const handleBackFromBloops = () => {
    setCurrentView('home');
  };

  const handleOpenAuth = useCallback((mode = 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleAuthSuccess = useCallback((data) => {
    console.log('Authentication successful:', data);
    dispatch(setAuth({
      user: data.user,
      token: data.accessToken
    }));
    setIsAuthModalOpen(false);
  }, [dispatch]);

  return (
    <div className="App">
      {currentView === 'home' && (
        <HomeFeed
          onNavigate={handleNavigate}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}
      {currentView === 'profile' && (
        <ViewProfile onNavigate={handleNavigate} />
      )}
      {currentView === 'user' && selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          onNavigate={handleNavigate}
          onBack={handleBackFromUser}
        />
      )}
      {currentView === 'post' && selectedPostId && (
        <SinglePost
          postId={selectedPostId}
          onBack={handleBackFromPost}
          onShowAuthModal={() => handleOpenAuth('login')}
          onUserClick={handleUserClick}
        />
      )}
      {currentView === 'bloops' && (
        <Bloops
          onBack={handleBackFromBloops}
          onViewPost={(postId) => {
            setSelectedPostId(postId);
            setCurrentView('post');
          }}
        />
      )}

      {/* Global Auth Modal for SinglePost */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModal}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;

