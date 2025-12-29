/**
 * Billing Service
 * Handles payment and billing API calls
 */
import api from './axios';

export const billingService = {
    // Create payment order
    createOrder: async (planId, couponCode = null) => {
        const data = { plan_id: planId };
        if (couponCode) {
            data.coupon_code = couponCode;
        }
        const response = await api.post('/api/billing/payments/create_order/', data);
        return response.data;
    },

    // Verify payment completion
    verifyPayment: async (orderId, paymentId, signature) => {
        const response = await api.post('/api/billing/payments/verify/', {
            order_id: orderId,
            payment_id: paymentId,
            signature: signature
        });
        return response.data;
    },

    // Get payment history
    getHistory: async () => {
        const response = await api.get('/api/billing/payments/history/');
        return response.data;
    },

    // Get invoices
    getInvoices: async () => {
        const response = await api.get('/api/billing/invoices/');
        return response.data;
    },

    // Get invoice by ID
    getInvoiceById: async (invoiceId) => {
        const response = await api.get(`/api/billing/invoices/${invoiceId}/`);
        return response.data;
    },

    // Validate coupon code
    validateCoupon: async (code, planId) => {
        const response = await api.post('/api/billing/coupons/validate/', {
            code: code,
            plan_id: planId
        });
        return response.data;
    }
};
