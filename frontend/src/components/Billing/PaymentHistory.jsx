import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { billingService } from '../../api/billingService';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payments');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsData, invoicesData] = await Promise.all([
                billingService.getHistory(),
                billingService.getInvoices()
            ]);
            setPayments(paymentsData);
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Failed to fetch billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'refunded': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading billing history...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Billing History
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        View your payment history and invoices
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 mb-6"
                >
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            activeTab === 'payments'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            activeTab === 'invoices'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Invoices
                    </button>
                </motion.div>

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {payments.length === 0 ? (
                            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
                                <div className="text-4xl mb-4">💳</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No payments yet</h3>
                                <p className="text-gray-500 text-sm">Your payment history will appear here</p>
                            </div>
                        ) : (
                            payments.map((payment, index) => (
                                <motion.div
                                    key={payment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {payment.plan_details?.display_name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.created_at).toLocaleDateString()} • 
                                                Receipt: {payment.receipt_number}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    ₹{payment.amount}
                                                </div>
                                                <div className="text-xs text-gray-500">{payment.currency}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {invoices.length === 0 ? (
                            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
                                <div className="text-4xl mb-4">📄</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No invoices yet</h3>
                                <p className="text-gray-500 text-sm">Invoices are generated after successful payments</p>
                            </div>
                        ) : (
                            invoices.map((invoice, index) => (
                                <motion.div
                                    key={invoice.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {invoice.invoice_number}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {new Date(invoice.created_at).toLocaleDateString()} • 
                                                {invoice.billing_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Subtotal: ₹{invoice.subtotal}</div>
                                                <div className="text-xs text-gray-500">Tax ({invoice.tax_rate}%): ₹{invoice.tax_amount}</div>
                                                <div className="font-bold text-gray-900 dark:text-white">Total: ₹{invoice.total}</div>
                                            </div>
                                            {invoice.pdf_url && (
                                                <a
                                                    href={invoice.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                >
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
