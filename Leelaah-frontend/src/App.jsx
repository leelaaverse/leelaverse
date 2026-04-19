import React, { useState, useCallback, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import socketService from './services/socket';
import HomeFeed from './components/HomeFeed/HomeFeed';
import ViewProfile from './components/ViewProfile/ViewProfile';
import UserProfile from './components/UserProfile/UserProfile';
import SinglePost from './components/SinglePost/SinglePost';
import ChatPage from './components/ChatPage/ChatPage';
import Bloops from './components/Bloops/Bloops';
import Community from './components/Community/Community';
import AdminCommunity from './components/Community/AdminCommunity';
import CoinStore from './components/CoinStore/CoinStore';
import SearchPage from './components/Search/SearchPage';
import Settings from './components/Settings/Settings';
import AIStudio from './components/AIStudio/AIStudio';
import ModelsPage from './components/AIStudio/ModelsPage';
import CreateModal from './components/CreateModal/CreateModal';
import FloatingPostProgress from './components/FloatingPostProgress/FloatingPostProgress';
import { PostProgressProvider } from './contexts/PostProgressContext';

// ... (existing imports)

// Inside App component return:
import AuthModal from './components/AuthModal/AuthModal';
import { setAuth } from './store/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'profile', 'user', or 'post'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPrompt, setCreateModalPrompt] = useState('');

  // Initialize socket connection when user is logged in
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (user && token) {
      console.log('🔌 Initializing socket connection...');
      socketService.connect(token);
    }

    return () => {
      if (socketService.connected) {
        socketService.disconnect();
      }
    };
  }, [user]);

  // Handle dark mode application on html element
  useEffect(() => {
    const applyTheme = () => {
      if (theme === 'Dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'Light') {
        document.documentElement.classList.remove('dark');
      } else if (theme === 'Auto') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Listener for system preference changes when in 'Auto' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'Auto') applyTheme();
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Sync currentView from pathname on page load
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      const validPaths = {
        'ai-studio': 'aiStudio',
        'aiStudio': 'aiStudio',
        'models': 'modelsPage',
        'modelsPage': 'modelsPage',
        'payment': 'coinStore',
        'coinStore': 'coinStore',
        'community': 'community',
        'admin-community': 'adminCommunity',
        'settings': 'settings',
        'bloops': 'bloops',
        'profile': 'profile'
      };
      
      if (path.startsWith('post/')) {
        const id = path.split('/')[1];
        if (id) {
          setSelectedPostId(id);
          setCurrentView('post');
          return;
        }
      }
      
      if (validPaths[path]) {
        setCurrentView(validPaths[path]);
      } else {
        setCurrentView('home');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view, data = null) => {
    if (view === 'post' && data) {
      setSelectedPostId(data);
    }
    if (view === 'user' && data) {
      // If navigating to own profile, go to ViewProfile instead
      if (user && data === user.id) {
        setCurrentView('profile');
        window.history.pushState({}, '', '/profile');
        return;
      }
      setSelectedUserId(data);
    }
    setCurrentView(view);
    
    // Update URL pathname for bookmarkable views
    const pathMap = {
      aiStudio: '/ai-studio',
      modelsPage: '/models',
      coinStore: '/payment',
      search: '/search',
      community: '/community',
      adminCommunity: '/admin-community',
      settings: '/settings',
      bloops: '/bloops',
      home: '/',
      profile: '/profile'
    };

    if (view === 'post' && data) {
      window.history.pushState({}, '', `/post/${data}`);
    } else if (pathMap[view] !== undefined) {
      window.history.pushState({}, '', pathMap[view]);
    }
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setCurrentView('post');
    window.history.pushState({}, '', `/post/${postId}`);
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
    window.history.pushState({}, '', '/');
  };

  const handleBackFromUser = () => {
    setSelectedUserId(null);
    setCurrentView('home');
  };

  const handleBackFromBloops = () => {
    setCurrentView('home');
  };

  const handleBackFromCommunity = () => {
    setCurrentView('home');
  };

  const handleBackFromCoinStore = () => {
    setCurrentView('home');
  };

  const handleOpenAuth = useCallback((mode = 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const [createModalData, setCreateModalData] = useState(null);

  const handleOpenCreateModal = useCallback((data = null) => {
    setCreateModalData(typeof data === 'string' ? { prompt: data } : data);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateModalData(null);
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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(28, 28, 35, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 99999,
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      {currentView === 'home' && (
        <HomeFeed
          onNavigate={handleNavigate}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}
      {currentView === 'profile' && (
        <ViewProfile
          onNavigate={handleNavigate}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}
      {currentView === 'user' && selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          onNavigate={handleNavigate}
          onBack={handleBackFromUser}
          onChatClick={() => setCurrentView('chat')}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}
      {currentView === 'post' && selectedPostId && (
        <SinglePost
          postId={selectedPostId}
          onBack={handleBackFromPost}
          onShowAuthModal={() => handleOpenAuth('login')}
          onUserClick={handleUserClick}
          onNavigate={handleNavigate}
          onOpenCreateModal={handleOpenCreateModal}
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
      {currentView === 'community' && (
        <Community
          onBack={handleBackFromCommunity}
          onNavigate={handleNavigate}
          onShowAuthModal={() => handleOpenAuth('login')}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}
      {currentView === 'adminCommunity' && (
        <AdminCommunity
          onShowAuthModal={() => handleOpenAuth('login')}
        />
      )}
      {currentView === 'chat' && (
        <ChatPage onBack={() => setCurrentView('home')} onNavigate={handleNavigate} />
      )}
      {currentView === 'coinStore' && (
        <CoinStore onBack={handleBackFromCoinStore} onNavigate={handleNavigate} />
      )}
      {currentView === 'search' && (
        <SearchPage
          onBack={() => setCurrentView('home')}
          onNavigate={handleNavigate}
          onUserClick={handleUserClick}
          onPostClick={handlePostClick}
        />
      )}
      {currentView === 'aiStudio' && (
        <AIStudio
          onBack={() => setCurrentView('home')}
          onNavigate={handleNavigate}
        />
      )}
      {currentView === 'modelsPage' && (
        <ModelsPage
          onBack={() => setCurrentView('home')}
          onNavigate={handleNavigate}
        />
      )}
      {currentView === 'settings' && (
        <Settings
          onBack={() => setCurrentView('home')}
          onNavigate={handleNavigate}
        />
      )}

      {/* Global Auth Modal for SinglePost */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onOpenAuth={handleOpenAuth}
        onNavigate={handleNavigate}
        initialData={createModalData}
      />

      {/* Floating progress widget for minimized posting */}
      <FloatingPostProgress />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModal}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

// Wrap App with PostProgressProvider
function AppWithProviders() {
  return (
    <PostProgressProvider>
      <App />
    </PostProgressProvider>
  );
}

export default AppWithProviders;
