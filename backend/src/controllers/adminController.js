const prisma = require('../config/prisma');

const VALID_CATEGORIES = ['image_generation', 'video_generation'];

class AdminController {
    constructor() {
        this.addModel = this.addModel.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.getModels = this.getModels.bind(this);
        this.deleteModel = this.deleteModel.bind(this);
    }

    /**
     * POST /api/admin/models
     * Add a new AI model to the registry
     */
    async addModel(req, res) {
        try {
            const { name, provider, category, modelId, coinCost, description } = req.body;

            // Validate required fields
            if (!name || !provider || !category || !modelId || coinCost === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: name, provider, category, modelId, coinCost',
                });
            }

            // Validate category
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
                });
            }

            // Validate coinCost
            const cost = parseInt(coinCost);
            if (isNaN(cost) || cost < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'coinCost must be a positive integer',
                });
            }

            const model = await prisma.aIModel.create({
                data: {
                    name,
                    provider,
                    category,
                    modelId,
                    coinCost: cost,
                    description: description || null,
                },
            });

            res.status(201).json({
                success: true,
                message: 'AI model added successfully',
                data: model,
            });
        } catch (error) {
            console.error('Add model error:', error);

            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0] || 'field';
                return res.status(400).json({
                    success: false,
                    message: `A model with this ${field} already exists`,
                });
            }

            res.status(500).json({ success: false, message: 'Failed to add AI model' });
        }
    }

    /**
     * GET /api/admin/models
     * List all AI models with optional category filter
     * Query: { category, active }
     */
    async getModels(req, res) {
        try {
            const { category, active } = req.query;

            const where = {};
            if (category && VALID_CATEGORIES.includes(category)) {
                where.category = category;
            }
            if (active !== undefined) {
                where.isActive = active === 'true';
            }

            const models = await prisma.aIModel.findMany({
                where,
                orderBy: [{ category: 'asc' }, { name: 'asc' }],
                include: {
                    _count: {
                        select: { usageLogs: true },
                    },
                },
            });

            res.json({
                success: true,
                data: models,
            });
        } catch (error) {
            console.error('Get models error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch AI models' });
        }
    }

    /**
     * PUT /api/admin/models/:id
     * Update an AI model
     */
    async updateModel(req, res) {
        try {
            const { id } = req.params;
            const { name, provider, category, modelId, coinCost, description, isActive } = req.body;

            // Check model exists
            const existing = await prisma.aIModel.findUnique({ where: { id } });
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'AI model not found',
                });
            }

            // Validate category if provided
            if (category && !VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
                });
            }

            // Build update data
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (provider !== undefined) updateData.provider = provider;
            if (category !== undefined) updateData.category = category;
            if (modelId !== undefined) updateData.modelId = modelId;
            if (coinCost !== undefined) {
                const cost = parseInt(coinCost);
                if (isNaN(cost) || cost < 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'coinCost must be a positive integer',
                    });
                }
                updateData.coinCost = cost;
            }
            if (description !== undefined) updateData.description = description;
            if (isActive !== undefined) updateData.isActive = Boolean(isActive);

            const model = await prisma.aIModel.update({
                where: { id },
                data: updateData,
            });

            res.json({
                success: true,
                message: 'AI model updated successfully',
                data: model,
            });
        } catch (error) {
            console.error('Update model error:', error);

            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0] || 'field';
                return res.status(400).json({
                    success: false,
                    message: `A model with this ${field} already exists`,
                });
            }

            res.status(500).json({ success: false, message: 'Failed to update AI model' });
        }
    }

    /**
     * DELETE /api/admin/models/:id
     * Soft-delete an AI model (sets isActive = false)
     */
    async deleteModel(req, res) {
        try {
            const { id } = req.params;

            const existing = await prisma.aIModel.findUnique({ where: { id } });
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'AI model not found',
                });
            }

            const model = await prisma.aIModel.update({
                where: { id },
                data: { isActive: false },
            });

            res.json({
                success: true,
                message: 'AI model deactivated successfully',
                data: model,
            });
        } catch (error) {
            console.error('Delete model error:', error);
            res.status(500).json({ success: false, message: 'Failed to deactivate AI model' });
        }
    }
}

module.exports = new AdminController();
