import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunk to fetch feed posts
export const fetchFeedPosts = createAsyncThunk(
	'posts/fetchFeedPosts',
	async ({ category = 'featured', page = 1, limit = 12 }, { rejectWithValue }) => {
		try {
			console.log('🔄 Fetching posts:', { category, page, limit });

			const response = await apiService.posts.getFeed({
				category,
				page,
				limit,
			});

			console.log('✅ Posts fetched successfully:', {
				count: response.data.posts?.length || 0,
				total: response.data.pagination?.total || 0
			});

			if (response.data.posts && response.data.posts.length > 0) {
				console.log('📸 First post:', {
					id: response.data.posts[0].id,
					hasImage: !!(response.data.posts[0].mediaUrl || response.data.posts[0].thumbnailUrl || response.data.posts[0].mediaUrls),
					category: response.data.posts[0].category
				});
			}

			return {
				posts: response.data.posts,
				pagination: response.data.pagination,
				category,
				page,
			};
		} catch (error) {
			console.error('❌ Failed to fetch posts:', {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status
			});
			return rejectWithValue(
				error.response?.data?.message || 'Failed to fetch posts'
			);
		}
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
	},
	reducers: {
		setCategory: (state, action) => {
			state.currentCategory = action.payload;
			state.posts = [];
			state.pagination.page = 1;
			state.hasMore = true;
		},
		resetPosts: (state) => {
			state.posts = [];
			state.pagination.page = 1;
			state.hasMore = true;
			state.error = null;
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

				console.log('📥 Redux: Received posts from API:', {
					page,
					receivedCount: posts.length,
					currentStateCount: state.posts.length,
					pagination
				});

				if (page === 1) {
					state.posts = posts;
					console.log('✅ Redux: Set posts (page 1), new count:', posts.length);
				} else {
					// Avoid duplicates
					const existingIds = new Set(state.posts.map((p) => p.id));
					const newPosts = posts.filter((p) => !existingIds.has(p.id));
					state.posts = [...state.posts, ...newPosts];
					console.log('✅ Redux: Appended posts (page', page, '), added:', newPosts.length, ', total now:', state.posts.length);
				}

				state.pagination = pagination;
				state.hasMore = pagination.page < pagination.pages;

				console.log('📊 Redux State Summary:', {
					totalPosts: state.posts.length,
					hasMore: state.hasMore,
					currentPage: state.pagination.page,
					totalPages: state.pagination.pages
				});
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
