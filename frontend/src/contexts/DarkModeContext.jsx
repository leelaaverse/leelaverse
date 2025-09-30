import React, { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export const useDarkMode = () => {
    const context = useContext(DarkModeContext)
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider')
    }
    return context
}

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        // Check if user has a preference stored
        const savedMode = localStorage.getItem('darkMode')
        if (savedMode) {
            setIsDarkMode(JSON.parse(savedMode))
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDarkMode(prefersDark)
        }
    }, [])

    useEffect(() => {
        // Update localStorage when mode changes
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode))

        // Update document class for Tailwind dark mode
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDarkMode])

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    )
}