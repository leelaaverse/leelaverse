const prisma = require('../config/prisma');
const crypto = require('crypto');

// Predefined coin plans
const COIN_PLANS = [
    {
        id: 'starter',
        name: 'Starter Pack',
        coins: 100,
        price: 99, // in INR (paise for Razorpay = 9900)
        popular: false,
        description: 'Perfect for trying out AI generation',
    },
    {
        id: 'popular',
        name: 'Popular Pack',
        coins: 500,
        price: 449,
        popular: true,
        description: 'Best value for regular creators',
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        coins: 1200,
        price: 999,
        popular: false,
        description: 'For power users and professionals',
    },
    {
        id: 'ultra',
        name: 'Ultra Pack',
        coins: 3000,
        price: 2299,
        popular: false,
        description: 'Maximum coins at the best rate',
    },
];

const CUSTOM_RATE = 0.99; // ₹0.99 per coin for custom amounts

class PaymentController {
    constructor() {
        this.getPlans = this.getPlans.bind(this);
        this.createOrder = this.createOrder.bind(this);
        this.verifyPayment = this.verifyPayment.bind(this);
        this.getTransactionHistory = this.getTransactionHistory.bind(this);
    }

    /**
     * GET /api/payments/plans
     * Returns predefined coin plans + custom rate
     */
    async getPlans(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    plans: COIN_PLANS,
                    customRate: CUSTOM_RATE,
                    minCustomCoins: 10,
                    currency: 'INR',
                },
            });
        } catch (error) {
            console.error('Get plans error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch plans' });
        }
    }

    /**
     * POST /api/payments/create-order
     * Creates a Razorpay order
     * Body: { planId: string } OR { customCoins: number }
     */
    async createOrder(req, res) {
        try {
            const Razorpay = require('razorpay');
            const { planId, customCoins } = req.body;
            const userId = req.user.id;

            let coins, amountInPaise, description;

            if (planId) {
                const plan = COIN_PLANS.find((p) => p.id === planId);
                if (!plan) {
                    return res.status(400).json({ success: false, message: 'Invalid plan ID' });
                }
                coins = plan.coins;
                amountInPaise = plan.price * 100; // Convert INR to paise
                description = `${plan.name} - ${plan.coins} Coins`;
            } else if (customCoins) {
                const coinCount = parseInt(customCoins);
                if (isNaN(coinCount) || coinCount < 10) {
                    return res.status(400).json({
                        success: false,
                        message: 'Minimum 10 coins required for custom purchase',
                    });
                }
                coins = coinCount;
                amountInPaise = Math.ceil(coinCount * CUSTOM_RATE * 100);
                description = `Custom Pack - ${coinCount} Coins`;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Either planId or customCoins is required',
                });
            }

            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `cn_${userId.slice(-8)}_${Date.now()}`,
                notes: {
                    userId,
                    coins: coins.toString(),
                    planId: planId || 'custom',
                },
            });

            res.json({
                success: true,
                data: {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    coins,
                    description,
                    keyId: process.env.RAZORPAY_KEY_ID,
                },
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({ success: false, message: 'Failed to create payment order' });
        }
    }

    /**
     * POST /api/payments/verify
     * Verifies Razorpay payment signature and credits coins
     * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, coins }
     */
    async verifyPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, coins } = req.body;
            const userId = req.user.id;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !coins) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required payment verification fields',
                });
            }

            // Verify signature
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed: invalid signature',
                });
            }

            // Credit coins to user in a transaction
            const coinAmount = parseInt(coins);

            const result = await prisma.$transaction(async (tx) => {
                // Get current user balance
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: { coinBalance: true, totalCoinsEarned: true },
                });

                const newBalance = user.coinBalance + coinAmount;

                // Update user coin balance
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: {
                        coinBalance: newBalance,
                        totalCoinsEarned: user.totalCoinsEarned + coinAmount,
                    },
                });

                // Create coin transaction record
                const transaction = await tx.coinTransaction.create({
                    data: {
                        userId,
                        type: 'purchase',
                        amount: coinAmount,
                        balanceAfter: newBalance,
                        description: `Purchased ${coinAmount} coins`,
                        paymentMethod: 'razorpay',
                        paymentProvider: 'razorpay',
                        transactionId: razorpay_payment_id,
                        status: 'completed',
                    },
                });

                return { updatedUser, transaction };
            });

            res.json({
                success: true,
                message: `Successfully added ${coinAmount} coins to your account`,
                data: {
                    coinBalance: result.updatedUser.coinBalance,
                    transactionId: result.transaction.id,
                },
            });
        } catch (error) {
            console.error('Payment verification error:', error);
            res.status(500).json({ success: false, message: 'Payment verification failed' });
        }
    }

    /**
     * GET /api/payments/history
     * Returns user's coin transaction history
     * Query: { page, limit, type }
     */
    async getTransactionHistory(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const type = req.query.type;
            const skip = (page - 1) * limit;

            const where = { userId };
            if (type) {
                where.type = type;
            }

            const [transactions, total] = await Promise.all([
                prisma.coinTransaction.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip,
                }),
                prisma.coinTransaction.count({ where }),
            ]);

            // Get current balance
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { coinBalance: true, totalCoinsEarned: true, totalCoinsSpent: true },
            });

            res.json({
                success: true,
                data: {
                    transactions,
                    balance: user.coinBalance,
                    totalEarned: user.totalCoinsEarned,
                    totalSpent: user.totalCoinsSpent,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            });
        } catch (error) {
            console.error('Transaction history error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch transaction history' });
        }
    }
}

module.exports = new PaymentController();
