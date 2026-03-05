import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage or default to 'Auto'
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return 'Auto'; // Default
};

const initialState = {
    theme: getInitialTheme()
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        }
    }
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
