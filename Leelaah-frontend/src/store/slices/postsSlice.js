import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunk to fetch feed posts
export const fetchFeedPosts = createAsyncThunk(
	'posts/fetchFeedPosts',
	async ({ category = 'featured', page = 1, limit = 12 }, { rejectWithValue }) => {
		try {
			const response = await apiService.posts.getFeed({
				category,
				page,
				limit,
			});

			return {
				posts: response.data.posts,
				pagination: response.data.pagination,
				category,
				page,
			};
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || 'Failed to fetch posts'
			);
		}
	},
	{
		// Prevent duplicate fetches: skip if page-1 data already exists for this category
		condition: ({ category, page }, { getState }) => {
			const { posts } = getState();
			// If loading, never dispatch again
			if (posts.loading || posts.loadingMore) return false;
			// If page 1 and we already have posts for this category, skip
			if (page === 1 && posts.posts.length > 0 && posts.currentCategory === category) {
				return false;
			}
			return true;
		},
	}
);

const postsSlice = createSlice({
	name: 'posts',
	initialState: {
		posts: [],
		currentCategory: 'featured',
		loading: false,
		loadingMore: false,
		error: null,
		pagination: {
			page: 1,
			limit: 12,
			total: 0,
			pages: 0,
		},
		hasMore: true,
		// Per-category cache to avoid re-fetching on navigation
		cachedCategories: {},
	},
	reducers: {
		setCategory: (state, action) => {
			const newCategory = action.payload;
			// Save current category data to cache before switching
			if (state.posts.length > 0) {
				state.cachedCategories[state.currentCategory] = {
					posts: state.posts,
					pagination: { ...state.pagination },
					hasMore: state.hasMore,
				};
			}
			state.currentCategory = newCategory;
			// Restore from cache if available
			const cached = state.cachedCategories[newCategory];
			if (cached) {
				state.posts = cached.posts;
				state.pagination = cached.pagination;
				state.hasMore = cached.hasMore;
			} else {
				state.posts = [];
				state.pagination = { page: 1, limit: 12, total: 0, pages: 0 };
				state.hasMore = true;
			}
		},
		resetPosts: (state) => {
			state.posts = [];
			state.pagination = { page: 1, limit: 12, total: 0, pages: 0 };
			state.hasMore = true;
			state.error = null;
			state.cachedCategories = {};
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFeedPosts.pending, (state, action) => {
				if (action.meta.arg.page === 1) {
					state.loading = true;
				} else {
					state.loadingMore = true;
				}
				state.error = null;
			})
			.addCase(fetchFeedPosts.fulfilled, (state, action) => {
				state.loading = false;
				state.loadingMore = false;

				const { posts, pagination, page } = action.payload;

				if (page === 1) {
					state.posts = posts;
				} else {
					// Avoid duplicates
					const existingIds = new Set(state.posts.map((p) => p.id));
					const newPosts = posts.filter((p) => !existingIds.has(p.id));
					state.posts = [...state.posts, ...newPosts];
				}

				state.pagination = pagination;
				state.hasMore = pagination.page < pagination.pages;
			})
			.addCase(fetchFeedPosts.rejected, (state, action) => {
				state.loading = false;
				state.loadingMore = false;
				state.error = action.payload;
			});
	},
});

export const { setCategory, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
