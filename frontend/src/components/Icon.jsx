import React from 'react'

const icons = {
    rocket: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            <path d="M12 16L16 21H8L12 16Z" />
        </svg>
    ),
    sparkles: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
            <path d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z" />
            <path d="M5 14L5.5 16.5L8 17L5.5 17.5L5 20L4.5 17.5L2 17L4.5 16.5L5 14Z" />
        </svg>
    ),
    artist: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2L3 9L12 22L21 9L12 2Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    robot: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <circle cx="8.5" cy="10.5" r="1.5" />
            <circle cx="15.5" cy="10.5" r="1.5" />
            <path d="M12 2V6" />
            <path d="M8 18V22" />
            <path d="M16 18V22" />
            <path d="M2 12H4" />
            <path d="M20 12H22" />
        </svg>
    ),
    lightning: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
    ),
    dollar: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M16 8V6C16 4.9 15.1 4 14 4H10C8.9 4 8 4.9 8 5.5S8.9 7 10 7H14V8" />
            <path d="M8 16V18C8 19.1 8.9 20 10 20H14C15.1 20 16 19.1 16 18.5S15.1 17 14 17H10V16" />
            <path d="M12 2V22" />
        </svg>
    ),
    arrow: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M5 12H19" />
            <path d="M12 5L19 12L12 19" />
        </svg>
    ),
    play: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M8 5V19L19 12L8 5Z" />
        </svg>
    ),
    trophy: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M6 9H4.5C3.12 9 2 10.12 2 11.5S3.12 14 4.5 14H6" />
            <path d="M18 9H19.5C20.88 9 22 10.12 22 11.5S20.88 14 19.5 14H18" />
            <path d="M6 9V7C6 4.79 7.79 3 10 3H14C16.21 3 18 4.79 18 7V9" />
            <path d="M6 14V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V14" />
        </svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12H22" />
            <path d="M12 2C14.5 4.5 16 8 16 12S14.5 19.5 12 22" />
            <path d="M12 2C9.5 4.5 8 8 8 12S9.5 19.5 12 22" />
        </svg>
    ),
    upvote: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M7 14L12 9L17 14" />
            <rect x="7" y="18" width="10" height="2" />
        </svg>
    ),
    shopping: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" />
            <path d="M3 6H21" />
            <path d="M16 10C16 12.21 14.21 14 12 14S8 12.21 8 10" />
        </svg>
    ),
    target: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M16 21V19C16 16.79 14.21 15 12 15H5C2.79 15 1 16.79 1 19V21" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M23 21V19C23 17.13 21.27 15.6 19 15.29" />
            <path d="M16 3.13C17.27 3.6 18 4.87 18 6.5S17.27 9.4 16 9.87" />
        </svg>
    ),
    diamond: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M6 3H18L22 9L12 21L2 9L6 3Z" />
            <path d="M12 9V21" />
            <path d="M22 9H2" />
        </svg>
    ),
    brain: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M9.5 2C8.67 2 8 2.67 8 3.5C7.17 3.5 6.5 4.17 6.5 5C5.67 5 5 5.67 5 6.5C4.17 6.5 3.5 7.17 3.5 8V16C3.5 17.93 5.07 19.5 9 19.5H15C18.93 19.5 20.5 17.93 20.5 16V8C20.5 7.17 19.83 6.5 19 6.5C19 5.67 18.33 5 17.5 5C17.5 4.17 16.83 3.5 16 3.5C16 2.67 15.33 2 14.5 2H9.5Z" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7C7 4.24 9.24 2 12 2S17 4.24 17 7V11" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    wrench: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9L19.1 0.5C19.5 0.1 20.1 0.1 20.5 0.5L23.5 3.5C23.9 3.9 23.9 4.5 23.5 4.9L19.1 9.3C18.7 8.9 18.1 8.9 17.7 9.3L14.7 6.3Z" />
            <path d="M2.5 21.5L7.1 16.9C7.5 17.3 8.1 17.3 8.5 16.9L11.5 13.9C11.9 13.5 11.9 12.9 11.5 12.5L8.5 9.5C8.1 9.1 7.5 9.1 7.1 9.5L4.1 12.5C3.7 12.9 3.7 13.5 4.1 13.9L2.5 21.5Z" />
        </svg>
    ),
    star: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
    ),
    moon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" />
        </svg>
    ),
    sun: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1V3" />
            <path d="M12 21V23" />
            <path d="M4.22 4.22L5.64 5.64" />
            <path d="M18.36 18.36L19.78 19.78" />
            <path d="M1 12H3" />
            <path d="M21 12H23" />
            <path d="M4.22 19.78L5.64 18.36" />
            <path d="M18.36 5.64L19.78 4.22" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <polyline points="20,6 9,17 4,12" />
        </svg>
    ),
    plus: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
            <path d="M12 5V19" />
            <path d="M5 12H19" />
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
            <path d="M18 6L6 18" />
            <path d="M6 6L18 18" />
        </svg>
    ),
    heart: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M20.84 4.61C20.3 4.07 19.66 3.64 18.96 3.36C18.26 3.08 17.51 2.95 16.75 2.98C15.99 3.01 15.25 3.2 14.58 3.54C13.91 3.88 13.32 4.36 12.84 4.95L12 5.84L11.16 4.95C10.68 4.36 10.09 3.88 9.42 3.54C8.75 3.2 8.01 3.01 7.25 2.98C6.49 2.95 5.74 3.08 5.04 3.36C4.34 3.64 3.7 4.07 3.16 4.61C1.65 6.12 1.65 8.52 3.16 10.03L12 18.87L20.84 10.03C22.35 8.52 22.35 6.12 20.84 4.61Z" />
        </svg>
    ),
    camera: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 4H15L17 6H21C22.1 6 23 6.9 23 8V19Z" />
            <circle cx="12" cy="13" r="4" />
        </svg>
    ),
    chat: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" />
        </svg>
    ),
    trending: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
            <polyline points="17,6 23,6 23,12" />
        </svg>
    ),
    grid: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 22S8 18 8 12V5L12 3L16 5V12C16 18 12 22 12 22Z" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    login: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" />
            <polyline points="10,17 15,12 10,7" />
            <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
    )
}

const Icon = ({ name, className = "w-5 h-5", ...props }) => {
    const IconComponent = icons[name]

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`)
        return null
    }

    return (
        <span className={`inline-flex items-center justify-center ${className}`} {...props}>
            {React.cloneElement(IconComponent, { className: "w-full h-full" })}
        </span>
    )
}

export default Icon