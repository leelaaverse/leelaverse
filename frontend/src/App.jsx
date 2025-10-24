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
    window.location.search.includes('success=true');

  // Debug logging
  console.log('AppContent - user:', user, 'loading:', loading, 'isOAuthCallback:', isOAuthCallback, 'pathname:', window.location.pathname)

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Bar Skeleton */}
        <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo Skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>

              {/* Navigation Skeleton */}
              <div className="hidden md:flex items-center gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                ))}
              </div>

              {/* Right Section Skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Skeleton - Desktop Only */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* User Card Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-3"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
                    <div className="flex justify-between w-full pt-3 mt-1 border-t border-gray-100 dark:border-gray-700">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="text-center">
                          <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 mx-auto"></div>
                          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Links Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feed Skeleton */}
            <div className="lg:col-span-3 space-y-8">
              {/* Creation Zone Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Feed Header Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>

              {/* Posts Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 ${i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
                      }`}
                  >
                    <div className={`${i === 0 ? 'aspect-[16/9]' : 'aspect-square'} bg-gray-200 dark:bg-gray-700 animate-pulse`}></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                      <div className="flex justify-between pt-2">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Skeleton */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
          <div className="flex items-center justify-around h-16 px-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
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
