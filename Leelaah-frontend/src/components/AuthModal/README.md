# AuthModal Component

Beautiful authentication modal component with login and signup functionality.

## Features

- ✨ Modern, glassmorphic design
- 🔐 Full authentication flow (Login & Signup)
- ✅ Form validation with error handling
- 🎨 Success/Error message alerts
- 🔄 Loading states
- 📱 Fully responsive design
- 🎯 Backend integration ready
- 💾 Token storage in localStorage
- 🔀 Easy mode switching between login/signup

## Usage

```jsx
import AuthModal from '../AuthModal/AuthModal';

const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
const [authMode, setAuthMode] = useState('login'); // or 'signup'

const handleAuthSuccess = (data) => {
    console.log('User data:', data.user);
    console.log('Access token:', data.accessToken);
};

<AuthModal
    isOpen={isAuthModalOpen}
    onClose={() => setIsAuthModalOpen(false)}
    mode={authMode}
    onSuccess={handleAuthSuccess}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Controls modal visibility |
| `onClose` | function | Callback when modal is closed |
| `mode` | string | 'login' or 'signup' |
| `onSuccess` | function | Callback with user data on successful auth |

## API Integration

The modal automatically integrates with your backend API:

### Login Endpoint
- **POST** `/api/auth/login`
- **Payload**: `{ email, password }`

### Signup Endpoint
- **POST** `/api/auth/register`
- **Payload**: `{ email, password, username, firstName, lastName }`

### Response Format
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": { ... },
        "accessToken": "...",
        "refreshToken": "..."
    }
}
```

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:3000
```

## Styling

The component uses custom CSS with:
- Gradient backgrounds
- Smooth animations
- Glassmorphic effects
- Responsive breakpoints
- Custom scrollbar styling

## Form Validation

- Email: Valid email format required
- Password: Minimum 6 characters
- Username: Minimum 3 characters (signup only)
- First Name: Required (signup only)

## Token Storage

Upon successful authentication:
- `accessToken` → localStorage
- `refreshToken` → localStorage
- `user` object → localStorage (JSON stringified)

## Future Enhancements

- [ ] OAuth integration (Google, Discord)
- [ ] Forgot password functionality
- [ ] Email verification flow
- [ ] Remember me functionality
- [ ] Password strength indicator
