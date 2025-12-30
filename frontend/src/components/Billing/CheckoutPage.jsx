import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { billingService } from '../../api/billingService';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const plan = location.state?.plan;
    
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const originalPrice = parseFloat(plan?.price_inr || 0);
    const discount = couponApplied?.discount_amount || 0;
    const finalPrice = originalPrice - discount;

    useEffect(() => {
        if (!plan) {
            navigate('/pricing');
        }
    }, [plan, navigate]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setLoading(true);
        setError('');
        
        try {
            const result = await billingService.validateCoupon(couponCode, plan.id);
            setCouponApplied(result);
        } catch (err) {
            setError(err.response?.data?.code || err.response?.data?.error || 'Invalid coupon');
            setCouponApplied(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponApplied(null);
        setError('');
    };

    const handlePayment = async () => {
        setProcessing(true);
        setError('');

        try {
            // Create payment order
            const orderData = await billingService.createOrder(plan.id, couponApplied?.coupon_code);
            
            // In production, integrate with Razorpay here
            // For now, simulate a successful payment
            const mockPaymentId = `pay_${Date.now()}`;
            const mockSignature = 'mock_signature';
            
            // Verify payment
            await billingService.verifyPayment(orderData.order_id, mockPaymentId, mockSignature);
            
            // Success - redirect to subscription page
            navigate('/subscription', { 
                state: { 
                    message: 'Payment successful! Your subscription is now active.' 
                } 
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!plan) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/pricing')}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 flex items-center gap-2"
                    >
                        ← Back to Plans
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Checkout
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Complete your purchase to activate your subscription
                    </p>
                </motion.div>

                {/* Order Summary */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{plan.display_name}</h4>
                            <p className="text-sm text-gray-500">{plan.validity_days} days access</p>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">₹{originalPrice}</div>
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="py-4 border-b border-gray-200 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Coupon Code
                        </label>
                        {couponApplied ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span className="font-mono text-green-700 dark:text-green-400">{couponApplied.coupon_code}</span>
                                    <span className="text-green-600 dark:text-green-400 text-sm">
                                        (-₹{couponApplied.discount_amount.toFixed(2)})
                                    </span>
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white font-mono uppercase"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={loading || !couponCode.trim()}
                                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {loading ? '...' : 'Apply'}
                                </button>
                            </div>
                        )}
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="py-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-900 dark:text-white">₹{originalPrice}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 dark:text-green-400">Discount</span>
                                <span className="text-green-600 dark:text-green-400">-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax (GST 18%)</span>
                            <span className="text-gray-900 dark:text-white">Included</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{finalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Plan Features */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What You'll Get</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {plan.roadmap_limit} {plan.is_short_roadmap ? 'short ' : ''}roadmap{plan.roadmap_limit > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {plan.project_limit_min === plan.project_limit_max 
                                ? `${plan.project_limit_min} project${plan.project_limit_min > 1 ? 's' : ''}`
                                : `${plan.project_limit_min}-${plan.project_limit_max} projects`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {plan.resume_limit === -1 ? 'Unlimited resume edits' : `${plan.resume_limit} resume${plan.resume_limit > 1 ? 's' : ''}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {plan.ats_scan_limit === -1 ? `Unlimited ATS scans (${plan.ats_rate_limit_per_day}/day)` : `${plan.ats_scan_limit} ATS scan${plan.ats_scan_limit > 1 ? 's' : ''}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Live portfolio for {plan.validity_days} days
                        </div>
                        {plan.portfolio_analytics && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Portfolio analytics
                            </div>
                        )}
                        {plan.custom_subdomain && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Custom subdomain (name.planorah.me)
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Payment Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay ₹{finalPrice.toFixed(2)}</>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        By completing this purchase, you agree to our Terms of Service.
                        Your subscription will be active immediately after payment.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
