import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
	baseURL: API_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Handle token refresh on 401
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem('refreshToken');
				if (refreshToken) {
					const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
						refreshToken,
					});

					localStorage.setItem('accessToken', data.accessToken);
					apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
					originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

					return apiClient(originalRequest);
				}
			} catch (refreshError) {
				// Refresh failed, clear tokens and redirect to login
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('user');
				window.location.href = '/';
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

// API Service functions
const apiService = {
	// Posts API
	posts: {
		getFeed: (params) => apiClient.get('/api/posts/feed', { params }),
		getBloops: (params) => apiClient.get('/api/posts/bloops', { params }),
		getPost: (postId) => apiClient.get(`/api/posts/${postId}`),
		createPost: (postData) => apiClient.post('/api/posts', postData),
		updatePost: (postId, postData) => apiClient.put(`/api/posts/${postId}`, postData),
		deletePost: (postId) => apiClient.delete(`/api/posts/${postId}`),
		getUserPosts: (userId) => apiClient.get(`/api/posts/user/${userId}`),

		// AI Generation
		generateImage: (data) => apiClient.post('/api/posts/generate-image', data),
		generateVideo: (data) => apiClient.post('/api/posts/generate-video', data),
		getGenerationResult: (requestId) => apiClient.get(`/api/posts/generation/${requestId}`),
		getMyGenerations: () => apiClient.get('/api/posts/my-generations'),
		createPostFromGeneration: (data) => apiClient.post('/api/posts/create-from-generation', data),

		// AI Models
		getModels: (type, featured = false) => apiClient.get('/api/posts/models', { params: { type, featured } }),

		// Direct File Upload
		uploadAndCreatePost: (data) => apiClient.post('/api/posts/upload', data),

		// Like APIs
		likePost: (postId) => apiClient.post(`/api/posts/${postId}/like`),
		unlikePost: (postId) => apiClient.delete(`/api/posts/${postId}/like`),
		checkLikeStatus: (postId) => apiClient.get(`/api/posts/${postId}/like-status`),

		// Comment APIs
		addComment: (postId, text, parentCommentId = null) =>
			apiClient.post(`/api/posts/${postId}/comments`, { text, parentCommentId }),
		getComments: (postId, params) => apiClient.get(`/api/posts/${postId}/comments`, { params }),
		deleteComment: (postId, commentId) => apiClient.delete(`/api/posts/${postId}/comments/${commentId}`),
	},

	// Auth API
	auth: {
		login: (credentials) => apiClient.post('/api/auth/login', credentials),
		register: (userData) => apiClient.post('/api/auth/register', userData),
		logout: () => apiClient.post('/api/auth/logout'),
		refreshToken: (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken }),
		getProfile: () => apiClient.get('/api/auth/profile'),
		updateProfile: (data) => apiClient.put('/api/auth/profile', data),
	},

	// Profile API
	profile: {
		updateProfile: (data) => apiClient.put('/api/profile', data),
		uploadAvatar: (image) => apiClient.post('/api/profile/avatar/upload', { image }),
		updateAvatar: (avatar) => apiClient.put('/api/profile/avatar', { avatar }),
		uploadCover: (image) => apiClient.post('/api/profile/cover/upload', { image }),
		updateCover: (coverImage) => apiClient.put('/api/profile/cover', { coverImage }),
		updateUsername: (username) => apiClient.put('/api/profile/username', { username }),
		updateBio: (bio) => apiClient.put('/api/profile/bio', { bio }),
		updateSocialLinks: (links) => apiClient.put('/api/profile/social', links),
		updateSettings: (settings) => apiClient.put('/api/profile/settings', settings),
		checkUsername: (username) => apiClient.get(`/api/profile/check-username/${username}`),
		getStats: () => apiClient.get('/api/profile/stats'),
	},

	// OAuth
	oauth: {
		google: () => `${API_URL}/api/oauth/google`,
		googleCallback: (code) => apiClient.get(`/api/oauth/google/callback?code=${code}`),
	},

	// Users API (Public Profiles & Follow)
	users: {
		getPublicProfile: (userId) => apiClient.get(`/api/users/${userId}/profile`),
		followUser: (userId) => apiClient.post(`/api/users/${userId}/follow`),
		unfollowUser: (userId) => apiClient.delete(`/api/users/${userId}/follow`),
		checkFollowStatus: (userId) => apiClient.get(`/api/users/${userId}/follow-status`),
		getFollowing: () => apiClient.get('/api/users/following'),
	},

	// Messages API
	messages: {
		sendMessage: (data) => apiClient.post('/api/messages/send', data),
		getConversations: () => apiClient.get('/api/messages/conversations'),
		getConversation: (conversationId) => apiClient.get(`/api/messages/conversation/${conversationId}`),
		getRequests: () => apiClient.get('/api/messages/requests'),
		acceptRequest: (conversationId) => apiClient.post(`/api/messages/requests/${conversationId}/accept`),
		rejectRequest: (conversationId) => apiClient.delete(`/api/messages/requests/${conversationId}/reject`),
		markAsRead: (conversationId) => apiClient.patch('/api/messages/read', { conversationId }),
	},

	// Payments API
	payments: {
		getPlans: () => apiClient.get('/api/payments/plans'),
		createOrder: (data) => apiClient.post('/api/payments/create-order', data),
		verifyPayment: (data) => apiClient.post('/api/payments/verify', data),
		getHistory: (params) => apiClient.get('/api/payments/history', { params }),
	},

	// ═══════════════════════════════════════════════
	// New AI Generation API (/api/ai/*)
	// ═══════════════════════════════════════════════
	ai: {
		// Models
		getModels: (category) => apiClient.get('/api/ai/models', { params: category ? { category } : {} }),
		getModelDetails: (modelId) => apiClient.get(`/api/ai/models/${modelId}`),

		// Text-to-Image
		generateImage: (data) => apiClient.post('/api/ai/image/generate', data, { timeout: 120000 }),
		getImageModels: () => apiClient.get('/api/ai/image/models'),

		// Image-to-Image editing
		editImage: (data) => apiClient.post('/api/ai/image/edit', data, { timeout: 120000 }),
		getEditModels: () => apiClient.get('/api/ai/image/edit/models'),

		// Background removal
		removeBackground: (data) => apiClient.post('/api/ai/utils/remove-background', data, { timeout: 60000 }),
		getBgRemovalModels: () => apiClient.get('/api/ai/utils/remove-background/models'),

		// Image upscale
		upscaleImage: (data) => apiClient.post('/api/ai/utils/upscale', data, { timeout: 120000 }),
		getUpscaleModels: () => apiClient.get('/api/ai/utils/upscale/models'),

		// Video upscale
		upscaleVideo: (data) => apiClient.post('/api/ai/video/upscale', data, { timeout: 180000 }),
		getVideoUpscaleModels: () => apiClient.get('/api/ai/video/upscale/models'),
	},

	// Community API
	community: {
		// Leaderboard
		getLeaderboard: (params) => apiClient.get('/api/community/leaderboard', { params }),
		getMyRank: () => apiClient.get('/api/community/leaderboard/me'),

		// Competitions
		getCompetitions: (params) => apiClient.get('/api/community/competitions', { params }),
		getCompetitionDetails: (id) => apiClient.get(`/api/community/competitions/${id}`),
		createCompetition: (data) => apiClient.post('/api/community/competitions', data),
		joinCompetition: (id) => apiClient.post(`/api/community/competitions/${id}/join`),
		submitEntry: (id, data) => apiClient.post(`/api/community/competitions/${id}/submit`, data),
		voteSubmission: (id, submissionId) => apiClient.post(`/api/community/competitions/${id}/vote/${submissionId}`),
		getSubmissions: (id, params) => apiClient.get(`/api/community/competitions/${id}/submissions`, { params }),

		// Templates
		getTemplates: (params) => apiClient.get('/api/community/templates', { params }),
		getTemplateDetails: (id) => apiClient.get(`/api/community/templates/${id}`),
		createTemplate: (data) => apiClient.post('/api/community/templates', data),
		useTemplate: (id) => apiClient.post(`/api/community/templates/${id}/use`),
		rateTemplate: (id, rating) => apiClient.post(`/api/community/templates/${id}/rate`, { rating }),

		// Badges
		getBadges: () => apiClient.get('/api/community/badges'),
		getMyBadges: () => apiClient.get('/api/community/badges/my'),
	},

	// Admin Community API
	adminCommunity: {
		getStats: () => apiClient.get('/api/admin/community/stats'),
		getCompetitions: (params) => apiClient.get('/api/admin/community/competitions', { params }),
		createCompetition: (data) => apiClient.post('/api/admin/community/competitions', data),
		updateCompetition: (id, data) => apiClient.patch(`/api/admin/community/competitions/${id}`, data),
		finalizeCompetition: (id) => apiClient.post(`/api/admin/community/competitions/${id}/finalize`),
		deleteCompetition: (id) => apiClient.delete(`/api/admin/community/competitions/${id}`),
		getBadges: () => apiClient.get('/api/admin/community/badges'),
		createBadge: (data) => apiClient.post('/api/admin/community/badges', data),
		updateBadge: (id, data) => apiClient.put(`/api/admin/community/badges/${id}`, data),
		getRewards: () => apiClient.get('/api/admin/community/rewards'),
		updateReward: (key, data) => apiClient.put(`/api/admin/community/rewards/${key}`, data),
		getLeaderboard: (params) => apiClient.get('/api/admin/community/leaderboard', { params }),
	},

	// Health check
	health: () => apiClient.get('/api/health'),
};

export default apiService;
export { apiClient, API_URL };
