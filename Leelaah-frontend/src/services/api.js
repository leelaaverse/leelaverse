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

	// Health check
	health: () => apiClient.get('/api/health'),
};

export default apiService;
export { apiClient, API_URL };
