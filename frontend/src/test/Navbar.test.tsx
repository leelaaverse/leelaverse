import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Navbar from '../components/Navbar'

// Mock the AuthContext
const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the brand name', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() })

    renderNavbar()

    expect(screen.getByText('Leelaaverse')).toBeInTheDocument()
  })

  it('shows login and register links when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() })

    renderNavbar()

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.queryByText('Feed')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('shows authenticated user navigation when user is logged in', () => {
    const mockUser = { id: 'user-1', username: 'testuser' }
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout })

    renderNavbar()

    expect(screen.getByText('Feed')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.queryByText('Register')).not.toBeInTheDocument()
  })

  it('calls logout and navigates to home when logout button is clicked', () => {
    const mockUser = { id: 'user-1', username: 'testuser' }
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout })

    renderNavbar()

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
