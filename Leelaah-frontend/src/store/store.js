import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import authReducer from './slices/authSlice';
import modelsReducer from './slices/modelsSlice';
import themeReducer from './slices/themeSlice';
import searchReducer from './slices/searchSlice';
import communityReducer from './slices/communitySlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		auth: authReducer,
		models: modelsReducer,
		theme: themeReducer,
		search: searchReducer,
		community: communityReducer,
		notifications: notificationReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;
