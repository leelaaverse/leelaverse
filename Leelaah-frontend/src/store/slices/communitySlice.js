import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchLeaderboard = createAsyncThunk(
  'community/fetchLeaderboard',
  async ({ period, search, page, limit } = {}, { rejectWithValue }) => {
    try {
      const response = await api.community.getLeaderboard({ period, search, page, limit });
      return { ...response.data, append: page > 1 };
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
  async ({ status, category, page, limit } = {}, { rejectWithValue }) => {
    try {
      const response = await api.community.getCompetitions({ status, category, page, limit });
      return { ...response.data, append: page > 1 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch competitions');
    }
  }
);

export const fetchCompetitionDetails = createAsyncThunk(
  'community/fetchCompetitionDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.community.getCompetitionDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch competition');
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  'community/fetchSubmissions',
  async ({ id, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.community.getSubmissions(id, { page });
      return { ...response.data, append: page > 1 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
    }
  }
);

export const joinCompetition = createAsyncThunk(
  'community/joinCompetition',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.community.joinCompetition(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join competition');
    }
  }
);

export const submitEntry = createAsyncThunk(
  'community/submitEntry',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.community.submitEntry(id, data);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit entry');
    }
  }
);

export const voteSubmission = createAsyncThunk(
  'community/voteSubmission',
  async ({ competitionId, submissionId }, { rejectWithValue }) => {
    try {
      const response = await api.community.voteSubmission(competitionId, submissionId);
      return { competitionId, submissionId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote');
    }
  }
);

export const fetchTemplates = createAsyncThunk(
  'community/fetchTemplates',
  async ({ category, sort, search, page, limit } = {}, { rejectWithValue }) => {
    try {
      const response = await api.community.getTemplates({ category, sort, search, page, limit });
      return { ...response.data, append: page > 1 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch templates');
    }
  }
);

export const fetchTemplateDetails = createAsyncThunk(
  'community/fetchTemplateDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.community.getTemplateDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch template');
    }
  }
);

export const useTemplate = createAsyncThunk(
  'community/useTemplate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.community.useTemplate(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to use template');
    }
  }
);

export const rateTemplate = createAsyncThunk(
  'community/rateTemplate',
  async ({ id, rating }, { rejectWithValue }) => {
    try {
      const response = await api.community.rateTemplate(id, rating);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate template');
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

export const fetchMyBadges = createAsyncThunk(
  'community/fetchMyBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.community.getMyBadges();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your badges');
    }
  }
);

// ─── Initial State ─────────────────────────────────────────────────────────────

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
  selectedCompetition: {
    data: null,
    userStatus: null,
    loading: false,
    error: null,
  },
  submissions: {
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
  selectedTemplate: {
    data: null,
    loading: false,
    error: null,
  },
  badges: {
    list: [],
    loading: false,
    error: null,
  },
  myBadges: {
    list: [],
    loading: false,
    error: null,
  },
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearCommunityErrors: (state) => {
      state.leaderboard.error = null;
      state.myRank.error = null;
      state.competitions.error = null;
      state.selectedCompetition.error = null;
      state.submissions.error = null;
      state.templates.error = null;
      state.selectedTemplate.error = null;
      state.badges.error = null;
      state.myBadges.error = null;
    },
    clearSelectedCompetition: (state) => {
      state.selectedCompetition.data = null;
      state.selectedCompetition.userStatus = null;
      state.selectedCompetition.error = null;
      state.submissions.list = [];
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate.data = null;
      state.selectedTemplate.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Leaderboard ──────────────────────────────
      .addCase(fetchLeaderboard.pending, (state) => { state.leaderboard.loading = true; })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.loading = false;
        const { data, append } = action.payload;
        state.leaderboard.users = append
          ? [...state.leaderboard.users, ...data.users]
          : data.users;
        state.leaderboard.total = data.total;
        state.leaderboard.page = data.page;
        state.leaderboard.hasMore = data.hasMore;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboard.loading = false;
        state.leaderboard.error = action.payload;
      })

      // ── My Rank ──────────────────────────────────
      .addCase(fetchMyRank.pending, (state) => { state.myRank.loading = true; })
      .addCase(fetchMyRank.fulfilled, (state, action) => {
        state.myRank.loading = false;
        state.myRank.data = action.payload.data;
      })
      .addCase(fetchMyRank.rejected, (state, action) => {
        state.myRank.loading = false;
        state.myRank.error = action.payload;
      })

      // ── Competitions list ─────────────────────────
      .addCase(fetchCompetitions.pending, (state) => { state.competitions.loading = true; })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.competitions.loading = false;
        const { data, append } = action.payload;
        state.competitions.list = append
          ? [...state.competitions.list, ...data.competitions]
          : data.competitions;
        state.competitions.total = data.total;
        state.competitions.page = data.page;
        state.competitions.hasMore = data.hasMore;
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.competitions.loading = false;
        state.competitions.error = action.payload;
      })

      // ── Competition detail ────────────────────────
      .addCase(fetchCompetitionDetails.pending, (state) => { state.selectedCompetition.loading = true; })
      .addCase(fetchCompetitionDetails.fulfilled, (state, action) => {
        state.selectedCompetition.loading = false;
        state.selectedCompetition.data = action.payload.data.competition;
        state.selectedCompetition.userStatus = action.payload.data.userStatus;
      })
      .addCase(fetchCompetitionDetails.rejected, (state, action) => {
        state.selectedCompetition.loading = false;
        state.selectedCompetition.error = action.payload;
      })

      // ── Submissions ───────────────────────────────
      .addCase(fetchSubmissions.pending, (state) => { state.submissions.loading = true; })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions.loading = false;
        const { data, append } = action.payload;
        state.submissions.list = append
          ? [...state.submissions.list, ...data.submissions]
          : data.submissions;
        state.submissions.total = data.total;
        state.submissions.page = data.page;
        state.submissions.hasMore = data.hasMore;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.submissions.loading = false;
        state.submissions.error = action.payload;
      })

      // ── Join Competition ──────────────────────────
      .addCase(joinCompetition.fulfilled, (state, action) => {
        if (state.selectedCompetition.data?.id === action.payload.id) {
          state.selectedCompetition.userStatus = {
            ...state.selectedCompetition.userStatus,
            hasJoined: true,
          };
          if (state.selectedCompetition.data) {
            state.selectedCompetition.data.participantsCount =
              (state.selectedCompetition.data.participantsCount || 0) + 1;
          }
        }
      })

      // ── Submit Entry ──────────────────────────────
      .addCase(submitEntry.fulfilled, (state, action) => {
        if (state.selectedCompetition.data?.id === action.payload.id) {
          state.selectedCompetition.userStatus = {
            ...state.selectedCompetition.userStatus,
            hasJoined: true,
            hasSubmitted: true,
          };
        }
      })

      // ── Vote ──────────────────────────────────────
      .addCase(voteSubmission.fulfilled, (state, action) => {
        const sub = state.submissions.list.find(s => s.id === action.payload.submissionId);
        if (sub) sub.votesCount = (sub.votesCount || 0) + 1;
      })

      // ── Templates list ────────────────────────────
      .addCase(fetchTemplates.pending, (state) => { state.templates.loading = true; })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates.loading = false;
        const { data, append } = action.payload;
        state.templates.list = append
          ? [...state.templates.list, ...data.templates]
          : data.templates;
        state.templates.total = data.total;
        state.templates.page = data.page;
        state.templates.hasMore = data.hasMore;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templates.loading = false;
        state.templates.error = action.payload;
      })

      // ── Template detail ───────────────────────────
      .addCase(fetchTemplateDetails.pending, (state) => { state.selectedTemplate.loading = true; })
      .addCase(fetchTemplateDetails.fulfilled, (state, action) => {
        state.selectedTemplate.loading = false;
        state.selectedTemplate.data = action.payload.data;
      })
      .addCase(fetchTemplateDetails.rejected, (state, action) => {
        state.selectedTemplate.loading = false;
        state.selectedTemplate.error = action.payload;
      })

      // ── Use Template ──────────────────────────────
      .addCase(useTemplate.fulfilled, (state, action) => {
        const tpl = state.templates.list.find(t => t.id === action.payload.id);
        if (tpl) tpl.usageCount = action.payload.data.data.usageCount;
        if (state.selectedTemplate.data?.id === action.payload.id) {
          state.selectedTemplate.data.usageCount = action.payload.data.data.usageCount;
        }
      })

      // ── Rate Template ─────────────────────────────
      .addCase(rateTemplate.fulfilled, (state, action) => {
        if (state.selectedTemplate.data?.id === action.payload.id) {
          state.selectedTemplate.data.rating = action.payload.data.data.averageRating;
          state.selectedTemplate.data.ratingCount = action.payload.data.data.totalRatings;
        }
      })

      // ── Badges ────────────────────────────────────
      .addCase(fetchBadges.pending, (state) => { state.badges.loading = true; })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.badges.loading = false;
        state.badges.list = action.payload.data;
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        state.badges.loading = false;
        state.badges.error = action.payload;
      })

      // ── My Badges ─────────────────────────────────
      .addCase(fetchMyBadges.pending, (state) => { state.myBadges.loading = true; })
      .addCase(fetchMyBadges.fulfilled, (state, action) => {
        state.myBadges.loading = false;
        state.myBadges.list = action.payload.data;
      })
      .addCase(fetchMyBadges.rejected, (state, action) => {
        state.myBadges.loading = false;
        state.myBadges.error = action.payload;
      });
  },
});

export const { clearCommunityErrors, clearSelectedCompetition, clearSelectedTemplate } = communitySlice.actions;
export default communitySlice.reducer;
