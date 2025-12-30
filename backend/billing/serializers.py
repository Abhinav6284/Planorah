from rest_framework import serializers
from .models import Payment, Invoice, Coupon, CouponUsage
from plans.serializers import PlanSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    plan_details = PlanSerializer(source='plan', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'plan',
            'plan_details',
            'amount',
            'currency',
            'payment_method',
            'gateway_order_id',
            'gateway_payment_id',
            'status',
            'receipt_number',
            'created_at',
            'completed_at',
        ]
        read_only_fields = [
            'id',
            'gateway_order_id',
            'gateway_payment_id',
            'receipt_number',
            'created_at',
            'completed_at',
        ]


class CreatePaymentSerializer(serializers.Serializer):
    """Serializer for creating a payment order."""
    
    plan_id = serializers.IntegerField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    def validate_plan_id(self, value):
        from plans.models import Plan
        try:
            Plan.objects.get(id=value, is_active=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive plan.")
        return value

    def validate_coupon_code(self, value):
        if value:
            try:
                coupon = Coupon.objects.get(code=value)
                if not coupon.is_valid:
                    raise serializers.ValidationError("Coupon is expired or invalid.")
            except Coupon.DoesNotExist:
                raise serializers.ValidationError("Invalid coupon code.")
        return value


class VerifyPaymentSerializer(serializers.Serializer):
    """Serializer for verifying payment completion."""
    
    order_id = serializers.CharField()
    payment_id = serializers.CharField()
    signature = serializers.CharField()


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model."""
    
    payment_details = PaymentSerializer(source='payment', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'billing_name',
            'billing_email',
            'billing_address',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'total',
            'pdf_url',
            'payment_details',
            'created_at',
        ]
        read_only_fields = fields


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for Coupon model."""
    
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'discount_type',
            'discount_value',
            'valid_from',
            'valid_until',
            'is_valid',
        ]
        read_only_fields = fields


class ApplyCouponSerializer(serializers.Serializer):
    """Serializer for applying a coupon."""
    
    code = serializers.CharField()
    plan_id = serializers.IntegerField()

    def validate(self, data):
        from plans.models import Plan
        
        try:
            coupon = Coupon.objects.get(code=data['code'])
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "Invalid coupon code."})
        
        if not coupon.is_valid:
            raise serializers.ValidationError({"code": "Coupon is expired or invalid."})
        
        try:
            plan = Plan.objects.get(id=data['plan_id'], is_active=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError({"plan_id": "Invalid plan."})
        
        # Check if coupon is applicable to this plan
        if coupon.applicable_plans.exists() and plan not in coupon.applicable_plans.all():
            raise serializers.ValidationError({"code": "Coupon not applicable for this plan."})
        
        data['coupon'] = coupon
        data['plan'] = plan
        return data
