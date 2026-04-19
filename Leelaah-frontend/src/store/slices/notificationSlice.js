import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Fetch notifications (paginated)
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const res = await apiService.notifications.getAll({ page, limit });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiService.notifications.getUnreadCount();
            return res.data.data.unreadCount;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
        }
    }
);

// Mark single notification as read
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            await apiService.notifications.markAsRead(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed');
        }
    }
);

// Mark all as read
export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await apiService.notifications.markAllAsRead();
            return true;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        hasMore: true,
        page: 1,
        error: null,
    },
    reducers: {
        // Called when a real-time notification arrives via Socket.io
        addRealtimeNotification: (state, action) => {
            // Prepend to list and increment unread
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        // Reset state on logout
        resetNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.loading = false;
            state.hasMore = true;
            state.page = 1;
            state.error = null;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                const { notifications, pagination, unreadCount } = action.payload;
                if (pagination.page === 1) {
                    state.notifications = notifications;
                } else {
                    // Append for infinite scroll, dedupe
                    const existingIds = new Set(state.notifications.map(n => n.id));
                    const newItems = notifications.filter(n => !existingIds.has(n.id));
                    state.notifications = [...state.notifications, ...newItems];
                }
                state.unreadCount = unreadCount;
                state.hasMore = pagination.hasMore;
                state.page = pagination.page;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchUnreadCount
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            // markAsRead
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const id = action.payload;
                const notif = state.notifications.find(n => n.id === id);
                if (notif && !notif.isRead) {
                    notif.isRead = true;
                    notif.readAt = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // markAllAsRead
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => {
                    n.isRead = true;
                    n.readAt = new Date().toISOString();
                });
                state.unreadCount = 0;
            });
    }
});

export const { addRealtimeNotification, resetNotifications, incrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
