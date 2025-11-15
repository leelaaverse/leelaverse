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
		getPost: (postId) => apiClient.get(`/api/posts/${postId}`),
		createPost: (postData) => apiClient.post('/api/posts', postData),
		deletePost: (postId) => apiClient.delete(`/api/posts/${postId}`),
		getUserPosts: (userId) => apiClient.get(`/api/posts/user/${userId}`),

		// AI Generation
		generateImage: (data) => apiClient.post('/api/posts/generate-image', data),
		getGenerationResult: (requestId) => apiClient.get(`/api/posts/generation/${requestId}`),
		getMyGenerations: () => apiClient.get('/api/posts/my-generations'),
		createPostFromGeneration: (data) => apiClient.post('/api/posts/create-from-generation', data),
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

	// OAuth
	oauth: {
		google: () => `${API_URL}/api/oauth/google`,
		googleCallback: (code) => apiClient.get(`/api/oauth/google/callback?code=${code}`),
	},

	// Health check
	health: () => apiClient.get('/api/health'),
};

export default apiService;
export { apiClient, API_URL };
