from django.contrib import admin
from .models import Payment, Invoice, Coupon, CouponUsage, PaymentWebhookEvent


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "receipt_number", "user", "plan", "amount", "currency",
        "payment_method", "status", "created_at",
    ]
    list_filter = ["status", "payment_method", "currency", "plan"]
    search_fields = ["user__username", "user__email", "receipt_number", "gateway_payment_id", "gateway_order_id"]
    readonly_fields = ["receipt_number", "created_at", "updated_at", "completed_at"]
    raw_id_fields = ["user", "plan", "subscription"]
    date_hierarchy = "created_at"


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "billing_name", "billing_email", "subtotal", "tax_amount", "total", "created_at"]
    search_fields = ["invoice_number", "billing_name", "billing_email"]
    readonly_fields = ["invoice_number", "created_at"]
    raw_id_fields = ["payment"]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        "code", "discount_type", "discount_value", "is_active",
        "times_used", "max_uses", "valid_from", "valid_until",
    ]
    list_filter = ["discount_type", "is_active"]
    search_fields = ["code"]
    filter_horizontal = ["applicable_plans"]
    readonly_fields = ["times_used"]


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ["coupon", "user", "used_at"]
    search_fields = ["coupon__code", "user__username", "user__email"]
    raw_id_fields = ["coupon", "user", "payment"]
    readonly_fields = ["used_at"]


@admin.register(PaymentWebhookEvent)
class PaymentWebhookEventAdmin(admin.ModelAdmin):
    list_display = ["gateway", "event_type", "status", "created_at", "processed_at"]
    list_filter = ["gateway", "status", "event_type"]
    search_fields = ["event_id", "event_type"]
    readonly_fields = ["gateway", "event_id", "event_type", "payload", "signature", "created_at", "processed_at"]
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
