import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

const normalizeModelMetadata = (model = {}) => ({
    ...model,
    requiresImage: Boolean(model.requiresImage),
    supportsMultipleImages: Boolean(model.supportsMultipleImages),
    minImages: Number.isInteger(model.minImages) ? model.minImages : (model.requiresImage ? 1 : 0),
    maxImages: Number.isInteger(model.maxImages) ? model.maxImages : (model.requiresImage ? 1 : 0),
});

export const fetchModels = createAsyncThunk(
    'models/fetchModels',
    async (_, { rejectWithValue }) => {
        try {
            // Fetch ALL models from new /api/ai/models endpoint
            const response = await apiService.ai.getModels();
            if (response.data.success) {
                const allModels = (response.data.data || []).map(normalizeModelMetadata);

                // Categorize models for different UIs
                const imageModels = allModels.filter(m =>
                    m.category === 'text-to-image' || m.category === 'text_to_image' || m.category === 'image_generation'
                );
                const imageEditModels = allModels.filter(m =>
                    m.category === 'image-to-image' || m.category === 'image_to_image' || m.category === 'image_editing'
                );
                const utilsModels = allModels.filter(m =>
                    m.category === 'background-removal' || m.category === 'image-upscale' || m.category === 'background_removal' || m.category === 'image_upscale'
                );
                const videoModels = allModels.filter(m =>
                    m.category === 'video-upscale' || m.category === 'video-generation' || m.category === 'video_upscale' || m.category === 'text_to_video'
                );

                return {
                    allModels,
                    imageModels,
                    imageEditModels,
                    utilsModels,
                    videoModels,
                    categories: response.data.categories || [],
                };
            } else {
                return rejectWithValue('Failed to fetch models');
            }
        } catch (error) {
            console.error('Failed to load AI models:', error);

            // Fallback: try old endpoint
            try {
                const fallback = await apiService.posts.getModels();
                if (fallback.data.success) {
                    const fallbackModels = [...(fallback.data.models.image || []), ...(fallback.data.models.video || [])]
                        .map(normalizeModelMetadata);

                    return {
                        allModels: fallbackModels,
                        imageModels: (fallback.data.models.image || []).map(normalizeModelMetadata),
                        imageEditModels: [],
                        utilsModels: [],
                        videoModels: (fallback.data.models.video || []).map(normalizeModelMetadata),
                        categories: [],
                    };
                }
            } catch (e) { /* ignored */ }

            // Last resort: hardcoded defaults
            const defaultModels = [
                normalizeModelMetadata({ id: 'flux-schnell', name: 'FLUX.1 Schnell', description: 'Fast generation', provider: 'Black Forest Labs', creditCost: 30, category: 'text_to_image', featured: true }),
                normalizeModelMetadata({ id: 'flux-dev', name: 'FLUX.1 Dev', description: 'High quality', provider: 'Black Forest Labs', creditCost: 80, category: 'text_to_image', featured: true }),
            ];
            return {
                allModels: defaultModels,
                imageModels: defaultModels,
                imageEditModels: [],
                utilsModels: [],
                videoModels: [],
                categories: [],
            };
        }
    }
);

const modelsSlice = createSlice({
    name: 'models',
    initialState: {
        allModels: [],
        imageModels: [],
        imageEditModels: [],
        utilsModels: [],
        videoModels: [],
        categories: [],
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
                state.allModels = action.payload.allModels;
                state.imageModels = action.payload.imageModels;
                state.imageEditModels = action.payload.imageEditModels;
                state.utilsModels = action.payload.utilsModels;
                state.videoModels = action.payload.videoModels;
                state.categories = action.payload.categories;
            })
            .addCase(fetchModels.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default modelsSlice.reducer;
