import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchLeaderboard = createAsyncThunk(
  'community/fetchLeaderboard',
  async ({ period, search, page } = {}, { rejectWithValue }) => {
    try {
      const response = await api.community.getLeaderboard({ period, search, page });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchMyRank = createAsyncThunk(
  'community/fetchMyRank',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.community.getMyRank();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your rank');
    }
  }
);

export const fetchCompetitions = createAsyncThunk(
  'community/fetchCompetitions',
  async ({ status, category, page } = {}, { rejectWithValue }) => {
    try {
      const response = await api.community.getCompetitions({ status, category, page });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch competitions');
    }
  }
);

export const fetchTemplates = createAsyncThunk(
  'community/fetchTemplates',
  async ({ category, sort, search, page } = {}, { rejectWithValue }) => {
    try {
      const response = await api.community.getTemplates({ category, sort, search, page });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch templates');
    }
  }
);

export const fetchBadges = createAsyncThunk(
  'community/fetchBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.community.getBadges();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch badges');
    }
  }
);

const initialState = {
  leaderboard: {
    users: [],
    total: 0,
    page: 1,
    hasMore: false,
    loading: false,
    error: null,
  },
  myRank: {
    data: null,
    loading: false,
    error: null,
  },
  competitions: {
    list: [],
    total: 0,
    page: 1,
    hasMore: false,
    loading: false,
    error: null,
  },
  templates: {
    list: [],
    total: 0,
    page: 1,
    hasMore: false,
    loading: false,
    error: null,
  },
  badges: {
    list: [],
    loading: false,
    error: null,
  }
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearCommunityErrors: (state) => {
      state.leaderboard.error = null;
      state.myRank.error = null;
      state.competitions.error = null;
      state.templates.error = null;
      state.badges.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboard.loading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.loading = false;
        if (action.payload.data.page === 1) {
          state.leaderboard.users = action.payload.data.users;
        } else {
          state.leaderboard.users = [...state.leaderboard.users, ...action.payload.data.users];
        }
        state.leaderboard.total = action.payload.data.total;
        state.leaderboard.page = action.payload.data.page;
        state.leaderboard.hasMore = action.payload.data.hasMore;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboard.loading = false;
        state.leaderboard.error = action.payload;
      })

      // My Rank
      .addCase(fetchMyRank.pending, (state) => {
        state.myRank.loading = true;
      })
      .addCase(fetchMyRank.fulfilled, (state, action) => {
        state.myRank.loading = false;
        state.myRank.data = action.payload.data;
      })
      .addCase(fetchMyRank.rejected, (state, action) => {
        state.myRank.loading = false;
        state.myRank.error = action.payload;
      })

      // Competitions
      .addCase(fetchCompetitions.pending, (state) => {
        state.competitions.loading = true;
      })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.competitions.loading = false;
        if (action.payload.data.page === 1) {
          state.competitions.list = action.payload.data.competitions;
        } else {
          state.competitions.list = [...state.competitions.list, ...action.payload.data.competitions];
        }
        state.competitions.total = action.payload.data.total;
        state.competitions.page = action.payload.data.page;
        state.competitions.hasMore = action.payload.data.hasMore;
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.competitions.loading = false;
        state.competitions.error = action.payload;
      })

      // Templates
      .addCase(fetchTemplates.pending, (state) => {
        state.templates.loading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates.loading = false;
        if (action.payload.data.page === 1) {
          state.templates.list = action.payload.data.templates;
        } else {
          state.templates.list = [...state.templates.list, ...action.payload.data.templates];
        }
        state.templates.total = action.payload.data.total;
        state.templates.page = action.payload.data.page;
        state.templates.hasMore = action.payload.data.hasMore;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templates.loading = false;
        state.templates.error = action.payload;
      })

      // Badges
      .addCase(fetchBadges.pending, (state) => {
        state.badges.loading = true;
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.badges.loading = false;
        state.badges.list = action.payload.data;
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        state.badges.loading = false;
        state.badges.error = action.payload;
      });
  }
});

export const { clearCommunityErrors } = communitySlice.actions;

export default communitySlice.reducer;
