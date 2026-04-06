import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuth } from '../../store/slices/authSlice';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import {
    PiWalletBold, PiCrownBold, PiDiamondBold, PiRocketBold, PiPlantBold,
    PiLightningBold, PiStarBold, PiFireBold, PiArrowLeftBold,
    PiShoppingBagBold, PiClockCounterClockwiseBold, PiSlidersHorizontalBold,
    PiArrowUpBold, PiArrowDownBold, PiTrendUpBold, PiTrendDownBold,
    PiShoppingCartBold, PiGiftBold, PiMagicWandBold, PiArrowCounterClockwiseBold,
    PiCalendarCheckBold, PiTrophyBold, PiMedalBold, PiReceiptBold,
    PiSpinnerGapBold, PiCheckBold, PiCoinsBold, PiCurrencyInrBold,
} from 'react-icons/pi';
import './CoinStore.css';

const SUBSCRIPTION_PLANS = [
    {
        id: 'free', name: 'Free', monthlyPrice: 0, annualPrice: 0, credits: 100,
        features: ['100 coins on signup', '5 image generations/day', 'Standard quality', 'Community support'],
        Icon: PiPlantBold, color: '#71717a',
    },
    {
        id: 'basic', name: 'Basic', monthlyPrice: 499, annualPrice: 3999, credits: 500,
        features: ['500 coins/month', '25 image generations/day', '5 video generations/day', 'HD quality', 'Email support'],
        Icon: PiRocketBold, color: '#3b82f6',
    },
    {
        id: 'pro', name: 'Pro', monthlyPrice: 1499, annualPrice: 11999, credits: 2000,
        features: ['2,000 coins/month', 'Unlimited image gen', '30 video generations/day', '4K quality', 'Priority support', 'Early access to models'],
        Icon: PiCrownBold, color: '#9b6cf8', recommended: true,
    },
    {
        id: 'ultimate', name: 'Ultimate', monthlyPrice: 3999, annualPrice: 29999, credits: 6000,
        features: ['6,000 coins/month', 'Unlimited everything', 'Max quality', 'API access', 'Dedicated support', 'Custom model training'],
        Icon: PiDiamondBold, color: '#f59e0b',
    },
];

const PLAN_ICONS = { starter: PiStarBold, popular: PiFireBold, pro: PiLightningBold, ultra: PiDiamondBold };
const TX_ICONS = { purchase: PiShoppingCartBold, signup_bonus: PiGiftBold, spend: PiMagicWandBold, earn: PiTrendUpBold, refund: PiArrowCounterClockwiseBold, daily_bonus: PiCalendarCheckBold, reward: PiTrophyBold, gift: PiGiftBold, achievement: PiMedalBold };
const TX_LABELS = { purchase: 'Purchase', signup_bonus: 'Signup Bonus', spend: 'AI Generation', earn: 'Earned', refund: 'Refund', daily_bonus: 'Daily Bonus', reward: 'Reward', gift: 'Gift', achievement: 'Achievement' };

const CoinStore = ({ onBack, onNavigate }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [plans, setPlans] = useState([]);
    const [customRate, setCustomRate] = useState(0.99);
    const [customCoins, setCustomCoins] = useState(50);
    const [balance, setBalance] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [activeSection, setActiveSection] = useState('coins');
    const [billingCycle, setBillingCycle] = useState('monthly');

    const loadRazorpayScript = useCallback(() => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) { resolve(true); return; }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [plansRes, historyRes] = await Promise.all([
                    apiService.payments.getPlans(),
                    apiService.payments.getHistory({ limit: 15 }),
                ]);
                setPlans(plansRes.data.data.plans);
                setCustomRate(plansRes.data.data.customRate);
                setBalance(historyRes.data.data.balance);
                setTotalEarned(historyRes.data.data.totalEarned);
                setTotalSpent(historyRes.data.data.totalSpent);
                setTransactions(historyRes.data.data.transactions);
            } catch (error) {
                console.error('Failed to load coin store:', error);
                toast.error('Failed to load coin store');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        loadRazorpayScript();
    }, [loadRazorpayScript]);

    const handlePurchase = async (planId = null) => {
        if (processing) return;
        setProcessing(true);
        try {
            const orderData = planId ? { planId } : { customCoins };
            const orderRes = await apiService.payments.createOrder(orderData);
            const order = orderRes.data.data;
            const options = {
                key: order.keyId, amount: order.amount, currency: order.currency,
                name: 'Leelaverse', description: order.description, order_id: order.orderId,
                handler: async (response) => {
                    try {
                        const verifyRes = await apiService.payments.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            coins: order.coins,
                        });
                        if (verifyRes.data.success) {
                            setBalance(verifyRes.data.data.coinBalance);
                            toast.success(`${order.coins} coins added to your account!`);
                            const profileRes = await apiService.auth.getProfile();
                            if (profileRes.data.success) {
                                dispatch(setAuth({ user: profileRes.data.data.user, token: localStorage.getItem('accessToken') }));
                            }
                            const historyRes = await apiService.payments.getHistory({ limit: 15 });
                            setTransactions(historyRes.data.data.transactions);
                            setTotalEarned(historyRes.data.data.totalEarned);
                        }
                    } catch (err) {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                prefill: { name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '', email: user?.email || '' },
                theme: { color: '#9b6cf8' },
                modal: { ondismiss: () => setProcessing(false) },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
            rzp.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) {
        return (
            <div className="cs-page">
                <div className="cs-loader"><div className="cs-spinner" /><p>Loading Store...</p></div>
            </div>
        );
    }

    return (
        <div className="cs-page">
            {/* Header */}
            <div className="cs-header">
                <div className="cs-header-left">
                    <button className="cs-back" onClick={onBack}><PiArrowLeftBold /></button>
                    <h1 className="cs-title">Store</h1>
                </div>
                <div className="cs-header-coins">
                    <PiCoinsBold />
                    <span>{balance.toLocaleString()} coins</span>
                </div>
            </div>

            {/* Balance Bar */}
            <div className="cs-balance-bar">
                <div className="cs-bal-item">
                    <div className="cs-bal-icon wallet"><PiWalletBold /></div>
                    <div>
                        <span className="cs-bal-num">{balance.toLocaleString()}</span>
                        <span className="cs-bal-lbl">Balance</span>
                    </div>
                </div>
                <div className="cs-bal-divider" />
                <div className="cs-bal-item">
                    <div className="cs-bal-icon earned"><PiTrendUpBold /></div>
                    <div>
                        <span className="cs-bal-num earned-text">+{totalEarned.toLocaleString()}</span>
                        <span className="cs-bal-lbl">Earned</span>
                    </div>
                </div>
                <div className="cs-bal-divider" />
                <div className="cs-bal-item">
                    <div className="cs-bal-icon spent"><PiTrendDownBold /></div>
                    <div>
                        <span className="cs-bal-num spent-text">-{totalSpent.toLocaleString()}</span>
                        <span className="cs-bal-lbl">Spent</span>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="cs-nav">
                <button className={`cs-nav-btn ${activeSection === 'coins' ? 'active' : ''}`} onClick={() => setActiveSection('coins')}>
                    <PiCoinsBold /> Buy Coins
                </button>
                <button className={`cs-nav-btn ${activeSection === 'subscription' ? 'active' : ''}`} onClick={() => setActiveSection('subscription')}>
                    <PiCrownBold /> Subscription Plans
                </button>
                <button className={`cs-nav-btn ${activeSection === 'history' ? 'active' : ''}`} onClick={() => setActiveSection('history')}>
                    <PiClockCounterClockwiseBold /> History
                </button>
            </div>

            {/* ===== COINS SECTION ===== */}
            {activeSection === 'coins' && (
                <div className="cs-section">
                    <div className="cs-coin-grid">
                        {plans.map((plan) => {
                            const PlanIcon = PLAN_ICONS[plan.id] || PiCoinsBold;
                            return (
                                <div key={plan.id} className={`cs-coin-card ${plan.popular ? 'featured' : ''}`}>
                                    {plan.popular && <div className="cs-badge">Best Value</div>}
                                    <div className={`cs-coin-icon ${plan.id}`}><PlanIcon /></div>
                                    <h3>{plan.name}</h3>
                                    <div className="cs-coin-amount"><PiCoinsBold /> {plan.coins.toLocaleString()}</div>
                                    <p className="cs-coin-desc">{plan.description}</p>
                                    <div className="cs-coin-price">
                                        <span className="cs-rupee">₹</span>
                                        <span className="cs-price-num">{plan.price}</span>
                                    </div>
                                    <span className="cs-per">₹{(plan.price / plan.coins).toFixed(2)}/coin</span>
                                    <button className="cs-buy" onClick={() => handlePurchase(plan.id)} disabled={processing}>
                                        {processing ? <PiSpinnerGapBold className="cs-spin-icon" /> : 'Purchase'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Custom Amount */}
                    <div className="cs-custom-wrap">
                        <h3 className="cs-sec-title"><PiSlidersHorizontalBold /> Custom Amount</h3>
                        <div className="cs-custom-card">
                            <div className="cs-custom-row">
                                <div className="cs-custom-input-box">
                                    <label>Coins</label>
                                    <div className="cs-input-field">
                                        <PiCoinsBold className="cs-field-icon" />
                                        <input type="number" min="10" max="10000" value={customCoins}
                                            onChange={(e) => setCustomCoins(Math.max(10, parseInt(e.target.value) || 10))} />
                                    </div>
                                </div>
                                <div className="cs-slider-box">
                                    <input type="range" min="10" max="5000" value={customCoins} className="cs-range"
                                        onChange={(e) => setCustomCoins(parseInt(e.target.value))} />
                                    <div className="cs-range-ticks"><span>10</span><span>2,500</span><span>5,000</span></div>
                                </div>
                                <div className="cs-custom-total-box">
                                    <span className="cs-ct-label">Total</span>
                                    <span className="cs-ct-price">₹{Math.ceil(customCoins * customRate).toLocaleString()}</span>
                                </div>
                            </div>
                            <button className="cs-custom-buy" onClick={() => handlePurchase(null)} disabled={processing || customCoins < 10}>
                                {processing ? <><PiSpinnerGapBold className="cs-spin-icon" /> Processing...</> : `Buy ${customCoins.toLocaleString()} Coins — ₹${Math.ceil(customCoins * customRate).toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SUBSCRIPTION SECTION ===== */}
            {activeSection === 'subscription' && (
                <div className="cs-section">
                    <div className="cs-sub-header">
                        <div>
                            <h2 className="cs-sub-title">Choose your plan</h2>
                            <p className="cs-sub-desc">Unlock the full creative power of AI generation</p>
                        </div>
                        <div className="cs-billing-toggle">
                            <button className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>Monthly</button>
                            <button className={billingCycle === 'annual' ? 'active' : ''} onClick={() => setBillingCycle('annual')}>
                                Annual <span className="cs-save-badge">Save 33%</span>
                            </button>
                        </div>
                    </div>

                    <div className="cs-sub-grid">
                        {SUBSCRIPTION_PLANS.map((sub) => {
                            const price = billingCycle === 'monthly' ? sub.monthlyPrice : Math.round(sub.annualPrice / 12);
                            const SubIcon = sub.Icon;
                            return (
                                <div key={sub.id} className={`cs-sub-card ${sub.recommended ? 'recommended' : ''}`}>
                                    {sub.recommended && <div className="cs-rec-badge">Recommended</div>}
                                    <div className="cs-sub-icon" style={{ background: `${sub.color}18`, color: sub.color }}>
                                        <SubIcon />
                                    </div>
                                    <h3 className="cs-sub-name">{sub.name}</h3>
                                    <div className="cs-sub-price-row">
                                        {price === 0 ? (
                                            <span className="cs-sub-price">Free</span>
                                        ) : (
                                            <>
                                                <span className="cs-sub-price"><span className="cs-r">₹</span>{price.toLocaleString()}</span>
                                                <span className="cs-sub-per">/month</span>
                                            </>
                                        )}
                                    </div>
                                    {billingCycle === 'annual' && sub.annualPrice > 0 && (
                                        <p className="cs-billed-annual">₹{sub.annualPrice.toLocaleString()} billed annually</p>
                                    )}
                                    <div className="cs-sub-credits">
                                        <PiCoinsBold /> {sub.credits.toLocaleString()} coins/mo
                                    </div>
                                    <ul className="cs-feature-list">
                                        {sub.features.map((feat, i) => (
                                            <li key={i}><PiCheckBold className="cs-check" /> {feat}</li>
                                        ))}
                                    </ul>
                                    <button className={`cs-sub-btn ${sub.recommended ? 'primary' : ''} ${sub.id === 'free' ? 'current' : ''}`}
                                        disabled={sub.id === 'free'}>
                                        {sub.id === 'free' ? 'Current Plan' : 'Get Started'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== HISTORY SECTION ===== */}
            {activeSection === 'history' && (
                <div className="cs-section">
                    {transactions.length === 0 ? (
                        <div className="cs-empty">
                            <PiReceiptBold />
                            <p>No transactions yet</p>
                            <span>Purchase coins or use AI features to see activity here</span>
                        </div>
                    ) : (
                        <div className="cs-tx-list">
                            {transactions.map((tx) => {
                                const TxIcon = TX_ICONS[tx.type] || PiCoinsBold;
                                return (
                                    <div key={tx.id} className="cs-tx">
                                        <div className={`cs-tx-icon ${tx.amount > 0 ? 'credit' : 'debit'}`}>
                                            <TxIcon />
                                        </div>
                                        <div className="cs-tx-info">
                                            <span className="cs-tx-type">{TX_LABELS[tx.type] || tx.type}</span>
                                            <span className="cs-tx-desc">{tx.description}</span>
                                            <span className="cs-tx-date">{formatDate(tx.createdAt)}</span>
                                        </div>
                                        <span className={`cs-tx-amt ${tx.amount > 0 ? 'credit' : 'debit'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CoinStore;
