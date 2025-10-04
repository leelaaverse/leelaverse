import { useState, useEffect } from 'react'
import { DarkModeProvider } from './contexts/DarkModeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Community from './components/Community'
import About from './components/About'
import Technology from './components/Technology'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import Newsletter from './components/Newsletter'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'
import WaitlistModal from './components/WaitlistModal'
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import OAuthCallback from './components/OAuthCallback'
import './App.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const { user, loading, logout } = useAuth()

  // Check if this is the OAuth callback route
  const isOAuthCallback = window.location.pathname === '/auth/callback' ||
                         window.location.search.includes('access_token');

  // Debug logging
  console.log('AppContent - user:', user, 'loading:', loading, 'isOAuthCallback:', isOAuthCallback)

  // Close modals when user is authenticated
  useEffect(() => {
    if (user) {
      setIsLoginModalOpen(false)
      setIsSignupModalOpen(false)
      setIsWaitlistModalOpen(false)
    }
  }, [user])

  // Show OAuth callback handler if this is the callback route
  if (isOAuthCallback) {
    return <OAuthCallback />
  }

  const renderPage = () => {
    if (user) {
      // Show Dashboard if user is logged in
      return <Dashboard user={user} onLogout={logout} />
    }

    // Show home page content if not logged in
    return (
      <>
        <Hero setIsWaitlistModalOpen={setIsWaitlistModalOpen} />
        <Features />
        <Community />
        <About />
        <Technology />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <Newsletter />
        <CTA setIsWaitlistModalOpen={setIsWaitlistModalOpen} />
        <Footer />
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {!user && (
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setIsWaitlistModalOpen={setIsWaitlistModalOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
          setIsSignupModalOpen={setIsSignupModalOpen}
        />
      )}
      {renderPage()}
      {!user && (
        <>
          <WaitlistModal isOpen={isWaitlistModalOpen} setIsOpen={setIsWaitlistModalOpen} />
          <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} setIsSignupModalOpen={setIsSignupModalOpen} />
          <SignupModal isOpen={isSignupModalOpen} setIsOpen={setIsSignupModalOpen} setIsLoginModalOpen={setIsLoginModalOpen} />
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  )
}

export default App
