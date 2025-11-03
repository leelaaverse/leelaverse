# Leelaah Frontend - React Components

This project has been converted from HTML to React with a modular component structure.

## 📁 Component Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation header with logo and tabs
│   ├── Navbar.css          # Navbar styles
│   ├── MainContent.jsx     # Main image grid content area
│   ├── MainContent.css     # MainContent styles
│   ├── FloatingBar.jsx     # Bottom floating navigation bar
│   ├── FloatingBar.css     # FloatingBar styles
│   ├── Sidebar.jsx         # Off-canvas profile sidebar
│   ├── Sidebar.css         # Sidebar styles
│   ├── HomeFeed.jsx        # Main container component
│   └── HomeFeed.css        # HomeFeed styles
├── App.jsx                 # Root application component
├── App.css                 # Global application styles
├── index.css               # Base CSS and font imports
└── main.jsx                # React entry point
```

## 🧩 Component Breakdown

### 1. **HomeFeed** (Main Container)
- **File**: `HomeFeed.jsx`
- **Purpose**: Main container that orchestrates all other components
- **State**: 
  - `activeTab`: Manages which tab is currently active (featured/trending/following)
- **Children**: Navbar, MainContent, FloatingBar, Sidebar

### 2. **Navbar** (Header Navigation)
- **File**: `Navbar.jsx`
- **Purpose**: Top navigation bar with logo, tab controls, and action buttons
- **Props**:
  - `activeTab`: Current active tab
  - `setActiveTab`: Function to change active tab
- **Features**:
  - Logo display
  - Featured/Trending/Following tab switcher
  - Message, notification, and menu buttons
  - Triggers sidebar on menu click

### 3. **MainContent** (Image Grid)
- **File**: `MainContent.jsx`
- **Purpose**: Displays responsive grid of images based on active tab
- **Props**:
  - `activeTab`: Determines which image set to display
- **Features**:
  - Different image layouts for featured, trending, and following tabs
  - Responsive grid (2 large images + 2 rows of 4 small images)
  - Automatically switches content based on tab

### 4. **FloatingBar** (Bottom Navigation)
- **File**: `FloatingBar.jsx`
- **Purpose**: Fixed bottom navigation with hover effects
- **Features**:
  - Browse, Explore, Generate, Community, and Reels buttons
  - Gradient background
  - Smooth hover animations with label expansion
  - Center-aligned floating design

### 5. **Sidebar** (Profile Off-Canvas)
- **File**: `Sidebar.jsx`
- **Purpose**: Slide-in profile menu from the right
- **Features**:
  - User profile information
  - Posts/Followers/Following stats
  - AI Credit usage progress bar
  - Navigation links (Profile, Account, Settings, Discord)
  - Theme and Language selectors
  - Logout button
- **Bootstrap**: Uses Bootstrap's offcanvas component

## 🎨 Styling Architecture

Each component has its own CSS file with scoped styles:

- **Global variables** defined in `App.css`:
  - `--main-color`: #150aa6
  - `--light-blue-color`: #477fdc
  - `--main-color2`: #112f58
  - etc.

- **Utility classes** for fonts and weights (font-10 to font-20, font-weight-400 to font-weight-800)

- **Responsive design** using Bootstrap grid system and custom media queries

## 🚀 How to Use

### Import the HomeFeed component in your App.jsx:

```jsx
import HomeFeed from './components/HomeFeed';

function App() {
  return (
    <div className="App">
      <HomeFeed />
    </div>
  );
}
```

### Required Assets

Make sure you have the following assets in your `public/assets/` folder:

**Images:**
- `logo-web.png` - Logo
- `Frame_1.png`, `Frame_2.png` - Large featured images
- `1.png`, `2.png`, `3.png`, `4.png` - Small grid images
- `profile.png` - User profile picture
- Various icon PNGs for sidebar menu items

**SVG Icons:**
- `home-rounded.svg`
- `search.svg`
- `add-outline.svg`
- `globe.svg`
- `play-list.svg`

## 📦 Dependencies

The project uses:
- **React** - UI library
- **Bootstrap 5.3.8** - CSS framework for layout and components
- **Font Awesome 7.0.1** - Icon library
- **Google Fonts (Poppins)** - Typography

All external dependencies are loaded via CDN in `index.html`.

## 🔧 Customization

### Change Tab Content
Edit the image arrays in `MainContent.jsx`:

```jsx
const featuredImages = {
  large: ['/assets/Frame_1.png', '/assets/Frame_2.png'],
  small: ['/assets/1.png', '/assets/2.png', '/assets/3.png', '/assets/4.png'],
};
```

### Modify Colors
Update CSS variables in `App.css`:

```css
:root {
  --main-color: #150aa6;
  --light-blue-color: #477fdc;
  /* Add more custom colors */
}
```

### Add New Tabs
1. Add new tab button in `Navbar.jsx`
2. Add corresponding content in `MainContent.jsx`
3. Update state logic in `HomeFeed.jsx`

## 📱 Responsive Breakpoints

- **Desktop**: > 1200px
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

All components are fully responsive with Bootstrap grid classes and custom media queries.

## 🎯 Key Features

✅ Fully modular component structure  
✅ Responsive design  
✅ Tab-based navigation  
✅ Smooth animations and transitions  
✅ Off-canvas sidebar with Bootstrap  
✅ Floating bottom navigation  
✅ Clean separation of concerns (CSS per component)  
✅ Reusable and maintainable code  

## 🐛 Troubleshooting

**Images not showing?**
- Make sure all assets are in `public/assets/` folder
- Check image paths start with `/assets/` not `./assets/`

**Bootstrap not working?**
- Verify CDN links are correct in `index.html`
- Check that Bootstrap JS is loaded after React root div

**Sidebar not opening?**
- Ensure Bootstrap JS is properly loaded
- Check data-bs-toggle and data-bs-target attributes match

---

Created by converting Sign up.html to modern React architecture with component-based design.
