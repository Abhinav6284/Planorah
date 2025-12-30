from django.contrib import admin
from .models import Payment, Invoice, Coupon, CouponUsage


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'amount', 'status', 'receipt_number', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['user__username', 'receipt_number', 'gateway_payment_id']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    raw_id_fields = ['user', 'plan', 'subscription']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'billing_name', 'total', 'created_at']
    search_fields = ['invoice_number', 'billing_name', 'billing_email']
    readonly_fields = ['created_at']
    raw_id_fields = ['payment']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_valid', 'times_used', 'valid_until']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code']
    filter_horizontal = ['applicable_plans']


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'used_at']
    search_fields = ['coupon__code', 'user__username']
    raw_id_fields = ['coupon', 'user', 'payment']

