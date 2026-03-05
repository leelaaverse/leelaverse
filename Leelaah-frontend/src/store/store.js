import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import authReducer from './slices/authSlice';
import modelsReducer from './slices/modelsSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		auth: authReducer,
		models: modelsReducer,
		theme: themeReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;
