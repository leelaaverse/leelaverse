import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
	name: 'auth',
	initialState: {
		isLoggedIn: false,
		user: null,
		token: null,
	},
	reducers: {
		setAuth: (state, action) => {
			state.isLoggedIn = true;
			state.user = action.payload.user;
			state.token = action.payload.token;
		},
		logout: (state) => {
			state.isLoggedIn = false;
			state.user = null;
			state.token = null;
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');
		},
		updateUser: (state, action) => {
			state.user = { ...state.user, ...action.payload };
		},
	},
});

export const { setAuth, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
