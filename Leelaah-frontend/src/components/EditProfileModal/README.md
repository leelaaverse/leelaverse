# EditProfileModal Component

## Overview
The `EditProfileModal` component provides a comprehensive profile editing interface allowing users to update their personal information, social links, and profile images through a clean tabbed modal interface.

## Features

### ✨ Core Functionality
- **Tabbed Interface**: Three organized sections (Basic Info, Social Links, Advanced)
- **Real-time Username Validation**: Live availability checking with visual feedback
- **Character Counter**: Bio length tracking (500 character limit)
- **Image Preview**: Avatar and cover image previews
- **Form Validation**: Client-side validation before submission
- **Redux Integration**: Automatic state updates after successful edits
- **Loading States**: Visual feedback during API operations
- **Error Handling**: Comprehensive error messages

### 📝 Editable Fields

#### Basic Info Tab
- First Name
- Last Name
- Username (with availability check)
- Bio (max 500 characters)
- Location
- Website URL

#### Social Links Tab
- Twitter
- Instagram
- LinkedIn
- GitHub
- Discord

#### Advanced Tab
- Avatar URL (with preview)
- Cover Image URL (with preview)

## Usage

```jsx
import EditProfileModal from '../EditProfileModal/EditProfileModal';

const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [userProfile, setUserProfile] = useState(null);

// In render
<EditProfileModal 
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    userProfile={userProfile}
/>

// Open modal
<button onClick={() => setIsEditModalOpen(true)}>
    Edit Profile
</button>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Callback to close modal |
| `userProfile` | object | Yes | User profile data object |

## API Endpoints Used

The component makes calls to multiple API endpoints:

```javascript
// Basic profile update
PUT /api/profile
Body: { firstName, lastName, bio, location, website }

// Username update
PUT /api/profile/username
Body: { username }

// Social links update
PUT /api/profile/social
Body: { twitterLink, instagramLink, linkedinLink, githubLink, discordLink }

// Avatar update
PUT /api/profile/avatar
Body: { avatarUrl }

// Cover image update
PUT /api/profile/cover
Body: { coverImageUrl }

// Username availability check
GET /api/profile/check-username/:username
```

## State Management

The component manages the following states:

```javascript
const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    coverImage: '',
    twitterLink: '',
    instagramLink: '',
    linkedinLink: '',
    githubLink: '',
    discordLink: ''
});

const [activeTab, setActiveTab] = useState('basic');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [usernameAvailable, setUsernameAvailable] = useState(null);
const [checkingUsername, setCheckingUsername] = useState(false);
```

## Form Validation

### Username Rules
- Length: 3-20 characters
- Format: Alphanumeric + underscore only
- Must be unique (real-time availability check)
- Debounced API calls (500ms)

### Bio Rules
- Max length: 500 characters
- Character counter shown

### URL Validation
- Website must be valid URL
- Social links must be valid URLs (except Discord)
- Discord accepts username#1234 format

## User Experience

### Visual Feedback
- **Loading**: Spinner shown during save operations
- **Success**: Green message with checkmark
- **Error**: Red message with alert icon
- **Username Available**: Green checkmark
- **Username Taken**: Red X icon
- **Checking**: Purple "Checking..." indicator

### Animations
- Modal fade-in with backdrop blur
- Slide-up animation on appear
- Tab transitions
- Button hover effects
- Form field focus states

### Responsive Design
- Desktop: 650px max width with scrollable content
- Tablet: Full width with adjusted padding
- Mobile: Stacked buttons, hidden tab text (icons only)

## Code Example

### Opening the Modal
```jsx
const handleEditProfile = () => {
    setIsEditModalOpen(true);
};

<button className="btn-edit-profile" onClick={handleEditProfile}>
    <i className="fa-solid fa-pen"></i>
    Edit Profile
</button>
```

### Handling Updates
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Update profile
        await apiService.profile.updateProfile({ /* ... */ });
        
        // Update username if changed
        if (formData.username !== userProfile?.username) {
            await apiService.profile.updateUsername(formData.username);
        }
        
        // Update social links
        await apiService.profile.updateSocialLinks({ /* ... */ });
        
        // Fetch fresh data
        const response = await apiService.auth.getProfile();
        dispatch(updateUser(response.data.data.user));
        
        setSuccess('Profile updated successfully!');
        setTimeout(onClose, 1500);
    } catch (error) {
        setError(error.response?.data?.message || 'Update failed');
    } finally {
        setLoading(false);
    }
};
```

## Styling

The component uses custom CSS with:
- Gradient backgrounds (#9b6cf8 purple theme)
- Smooth transitions and animations
- Glassmorphism effects
- Custom scrollbar styling
- Focus states with glow effects
- Responsive breakpoints

### Key CSS Classes
```css
.edit-profile-modal-overlay  /* Backdrop */
.edit-profile-modal          /* Modal container */
.modal-header                /* Header with title */
.modal-tabs                  /* Tab navigation */
.tab-btn                     /* Individual tab */
.modal-body                  /* Scrollable content */
.form-group                  /* Form field wrapper */
.username-input-group        /* Username with status */
.image-preview               /* Image previews */
.modal-actions               /* Button footer */
```

## Integration with Redux

After successful profile update:
```javascript
// Update Redux store
dispatch(updateUser(updatedUser));

// Update localStorage
localStorage.setItem('user', JSON.stringify(updatedUser));
```

## Error Handling

Common errors handled:
- Network failures
- Validation errors (400)
- Authentication errors (401)
- Username conflicts (409)
- Server errors (500)

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus management
- ARIA labels on buttons
- Clear error messages
- Visual status indicators

## Performance Optimizations

- Debounced username availability checks (500ms)
- Conditional API calls (only when data changes)
- Optimistic UI updates
- Lazy loading of images
- Minimal re-renders with proper state management

## Future Enhancements

Planned features:
- [ ] File upload for avatar/cover (drag & drop)
- [ ] Image cropping tool
- [ ] Password change section
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Account deletion
- [ ] Privacy settings
- [ ] Notification preferences
- [ ] Theme customization
- [ ] Export user data

## Dependencies

```json
{
    "react": "^18.x",
    "react-redux": "^8.x",
    "Font Awesome": "^6.x"
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Modal Not Opening
- Check `isOpen` prop value
- Verify `userProfile` data exists
- Check console for errors

### Username Check Not Working
- Ensure backend endpoint is running
- Check network tab for API call
- Verify authentication token

### Images Not Showing
- Validate URL format
- Check CORS settings
- Verify image accessibility

### Save Button Disabled
- Username availability must be checked
- All required fields must be filled
- Cannot have validation errors

## License

MIT License - See LICENSE file for details
