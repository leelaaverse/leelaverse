# GenerateModal Component

## Overview
The GenerateModal is a comprehensive multi-step modal component for creating posts in the Leelaverse application. It supports both file uploads and AI-generated content.

## Features

### 1. Multi-Step Flow
- **Step 1: Choose Option** - Select between Upload Post or Create AI
- **Step 2: Crop Image** - Adjust uploaded image with aspect ratio controls
- **Step 3: Post Details** - Add caption, location, collaborators, and settings
- **Step 4: AI Generation** - Generate images, videos, or audio using AI

### 2. Upload Functionality
- Browse and select image files
- Real-time image preview
- Aspect ratio selection (1:1, 16:9, 4:5, 9:16, 3:2)
- Crop controls
- Caption with character counter (0/2000)
- Add location and collaborators
- Advanced settings toggle

### 3. AI Generation
- Three content types: Image, Video, Audio
- Text prompt input
- Model selection (Auto, GPT-4, GPT-5, GPT-5 Mini)
- Aspect ratio selection
- Upload type toggle (Draft/Profile)
- Credit coin cost display (150 credits)

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Controls modal visibility |
| onClose | function | Yes | Callback when modal closes |

## Usage

```jsx
import React, { useState } from 'react';
import GenerateModal from '../GenerateModal/GenerateModal';

function MyComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsModalOpen(true)}>
                Generate
            </button>

            <GenerateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
```

## Integration with FloatingBar

The GenerateModal is integrated into the FloatingBar component, triggered by the Generate button:

```jsx
// FloatingBar.jsx
const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

<button onClick={() => setIsGenerateModalOpen(true)}>
    Generate
</button>

<GenerateModal
    isOpen={isGenerateModalOpen}
    onClose={() => setIsGenerateModalOpen(false)}
/>
```

## State Management

The component manages its own internal state:

```javascript
const [modalStep, setModalStep] = useState('choose'); // 'choose', 'upload', 'crop', 'details', 'ai'
const [selectedImage, setSelectedImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [aiTab, setAiTab] = useState('image'); // 'image', 'video', 'audio'
const [aspectRatio, setAspectRatio] = useState('1:1');
const [uploadType, setUploadType] = useState('draft'); // 'draft' or 'profile'
const [formData, setFormData] = useState({
    prompt: '',
    caption: '',
    model: 'auto',
    aspectRatio: '1x1'
});
```

## Navigation Flow

### Upload Flow:
1. Choose Option → Click "Browse Files"
2. Crop → Adjust image and aspect ratio → Click "Next"
3. Post Details → Add caption and settings → Click "Share"

### AI Generation Flow:
1. Choose Option → Click "Generate AI"
2. AI Generation → Select tab (Image/Video/Audio)
3. Fill prompt and settings → Click "Generate"

### Back Navigation:
- Crop screen: Back arrow → Choose Option
- Post Details: Back arrow → Crop
- AI Generation: Back arrow → Choose Option

## Styling

The component uses custom CSS with:
- Dark theme (#1a1a1a background)
- Gradient buttons (purple and green)
- Glassmorphism effects
- Smooth transitions and hover states
- Responsive design for mobile

## API Integration (TODO)

The component has placeholders for API integration:

### AI Generation:
```javascript
const handleAIGenerate = async () => {
    // TODO: Call AI generation API
    // POST /api/posts/generate-image
    // Body: { prompt, model, aspectRatio, uploadType }
};
```

### Post Sharing:
```javascript
const handleShare = async () => {
    // TODO: Call post creation API
    // POST /api/posts
    // Body: FormData with image and caption
};
```

## Assets Required

The component expects the following image assets in `/assets/`:

- `upload-2.png` - Upload icon
- `ai-idea.png` - AI icon
- `gg_ratio.png` - Aspect ratio icon
- `box-multiple.png` - Multiple selection icon
- `ellipse4.png` - User avatar
- `emoji-16-regular.png` - Emoji icon
- `mi_location.png` - Location icon
- `hugeicons_ai-user.png` - Collaborators icon
- `icon-park-outline_down.png` - Dropdown arrow
- `ri_dvd-ai-line.png` - AI credit icon
- `mage_image-upload.png` - Upload reference icon
- `si_ai-fill.png` - AI generate icon

## Browser Support

- Modern browsers with ES6+ support
- FileReader API for image preview
- CSS Grid and Flexbox for layout

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Semantic HTML structure

## Future Enhancements

1. **Image Cropping Library**: Integrate a library like `react-image-crop` for advanced cropping
2. **Video Upload**: Support video file uploads with preview
3. **Audio Upload**: Support audio file uploads with waveform
4. **Multiple Images**: Support multi-image carousel posts
5. **Draft Saving**: Auto-save drafts to prevent data loss
6. **Progress Indicators**: Show upload/generation progress
7. **Error Handling**: Better error messages and retry logic
8. **Image Filters**: Apply filters and effects to uploaded images
9. **Emoji Picker**: Integrate emoji picker for captions
10. **Location Search**: Autocomplete for location selection

## Related Components

- **FloatingBar**: Parent component that triggers the modal
- **HomeFeed**: Uses FloatingBar with GenerateModal
- **PostCard**: Displays generated/uploaded posts
- **Sidebar**: May show drafts and recent posts

## Notes

- Modal closes on overlay click and ESC key
- Form data resets on modal close
- Image preview uses FileReader for client-side rendering
- Responsive design adapts to mobile screens
- Z-index is 9999 to ensure modal appears above all content
