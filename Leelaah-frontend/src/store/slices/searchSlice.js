import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

// Fetch trending/explore data (cached in Redux)
export const fetchExploreData = createAsyncThunk(
    'search/fetchExploreData',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/api/search/trending');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch explore data');
        }
    }
);

// Fetch explore posts for infinite scroll (page-based)
export const fetchExplorePosts = createAsyncThunk(
    'search/fetchExplorePosts',
    async ({ page = 1, limit = 18 }, { rejectWithValue }) => {
        try {
            // Use the feed endpoint with 'featured' to get a mix of posts+videos
            const response = await apiClient.get('/api/posts/feed', {
                params: { category: 'featured', page, limit }
            });
            return {
                posts: response.data.posts,
                pagination: response.data.pagination,
                page,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

// Fetch suggestions (not cached — called per debounce)
export const fetchSuggestions = createAsyncThunk(
    'search/fetchSuggestions',
    async (query, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/api/search/suggestions', {
                params: { q: query }
            });
            return data;
        } catch (error) {
            return rejectWithValue('Failed to fetch suggestions');
        }
    }
);

// Full search results
export const fetchSearchResults = createAsyncThunk(
    'search/fetchSearchResults',
    async ({ query, cursor = null, limit = 15 }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/api/search', {
                params: { q: query, limit, ...(cursor ? { cursor } : {}) }
            });
            return { ...data, cursor, query };
        } catch (error) {
            return rejectWithValue('Search failed');
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        // Explore/trending data (cached)
        exploreData: null,
        exploreLoading: false,
        exploreLoaded: false, // prevents re-fetching on revisit

        // Explore infinite scroll posts
        explorePosts: [],
        explorePostsPage: 0,
        explorePostsHasMore: true,
        explorePostsLoading: false,

        // Suggestions
        suggestions: null,
        suggestionsLoading: false,

        // Full search results
        searchResults: [],
        searchNextCursor: null,
        searchHasMore: true,
        searchLoading: false,
        searchQuery: '',
    },
    reducers: {
        clearSuggestions: (state) => {
            state.suggestions = null;
            state.suggestionsLoading = false;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchNextCursor = null;
            state.searchHasMore = true;
            state.searchQuery = '';
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        resetExploreData: (state) => {
            state.exploreData = null;
            state.exploreLoaded = false;
            state.explorePosts = [];
            state.explorePostsPage = 0;
            state.explorePostsHasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // Explore data
            .addCase(fetchExploreData.pending, (state) => {
                state.exploreLoading = true;
            })
            .addCase(fetchExploreData.fulfilled, (state, action) => {
                state.exploreLoading = false;
                state.exploreData = action.payload;
                state.exploreLoaded = true;
            })
            .addCase(fetchExploreData.rejected, (state) => {
                state.exploreLoading = false;
            })

            // Explore posts (infinite scroll)
            .addCase(fetchExplorePosts.pending, (state) => {
                state.explorePostsLoading = true;
            })
            .addCase(fetchExplorePosts.fulfilled, (state, action) => {
                state.explorePostsLoading = false;
                const { posts, pagination, page } = action.payload;

                if (page === 1) {
                    state.explorePosts = posts;
                } else {
                    const existingIds = new Set(state.explorePosts.map(p => p.id));
                    const newPosts = posts.filter(p => !existingIds.has(p.id));
                    state.explorePosts = [...state.explorePosts, ...newPosts];
                }

                state.explorePostsPage = pagination.page;
                state.explorePostsHasMore = pagination.page < pagination.pages;
            })
            .addCase(fetchExplorePosts.rejected, (state) => {
                state.explorePostsLoading = false;
            })

            // Suggestions
            .addCase(fetchSuggestions.pending, (state) => {
                state.suggestionsLoading = true;
            })
            .addCase(fetchSuggestions.fulfilled, (state, action) => {
                state.suggestionsLoading = false;
                state.suggestions = action.payload;
            })
            .addCase(fetchSuggestions.rejected, (state) => {
                state.suggestionsLoading = false;
            })

            // Search results
            .addCase(fetchSearchResults.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(fetchSearchResults.fulfilled, (state, action) => {
                state.searchLoading = false;
                const { results, nextCursor, cursor, query } = action.payload;

                if (!cursor) {
                    // First page
                    state.searchResults = results;
                } else {
                    const existingIds = new Set(state.searchResults.map(r => r.id));
                    const newResults = results.filter(r => !existingIds.has(r.id));
                    state.searchResults = [...state.searchResults, ...newResults];
                }

                state.searchNextCursor = nextCursor;
                state.searchHasMore = !!nextCursor;
                state.searchQuery = query;
            })
            .addCase(fetchSearchResults.rejected, (state) => {
                state.searchLoading = false;
            });
    },
});

export const { clearSuggestions, clearSearchResults, setSearchQuery, resetExploreData } = searchSlice.actions;
export default searchSlice.reducer;
