import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchModels = createAsyncThunk(
    'models/fetchModels',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.posts.getModels();
            if (response.data.success) {
                return {
                    imageModels: response.data.models.image || [],
                    videoModels: response.data.models.video || []
                };
            } else {
                return rejectWithValue('Failed to fetch models: Unsuccessful response');
            }
        } catch (error) {
            console.error('Failed to load AI models:', error);
            // Fallback to default models if API fails
            return {
                imageModels: [
                    { id: 'flux-schnell', name: 'FLUX Schnell', description: 'Fast (15-20s)' },
                    { id: 'flux-1-srpo', name: 'FLUX.1 SRPO', description: 'Quality (25-35s)' }
                ],
                videoModels: []
            };
        }
    }
);

const modelsSlice = createSlice({
    name: 'models',
    initialState: {
        imageModels: [],
        videoModels: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchModels.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchModels.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.imageModels = action.payload.imageModels;
                state.videoModels = action.payload.videoModels;
            })
            .addCase(fetchModels.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default modelsSlice.reducer;
