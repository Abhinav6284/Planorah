from django.db import models
from django.conf import settings
from django.utils import timezone


class Payment(models.Model):
    """
    Payment records for subscription purchases.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('stripe', 'Stripe'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    plan = models.ForeignKey(
        'plans.Plan',
        on_delete=models.PROTECT,
        related_name='payments'
    )
    subscription = models.ForeignKey(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    
    # Payment gateway info
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)
    gateway_order_id = models.CharField(max_length=255, blank=True)
    gateway_payment_id = models.CharField(max_length=255, blank=True)
    gateway_signature = models.CharField(max_length=500, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Metadata
    receipt_number = models.CharField(max_length=50, unique=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['gateway_order_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - ₹{self.amount} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            # Generate receipt number
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            self.receipt_number = f"PLN-{timestamp}-{self.user.id}"
        super().save(*args, **kwargs)

    def mark_completed(self, gateway_payment_id, gateway_signature=''):
        """Mark payment as completed."""
        self.status = 'completed'
        self.gateway_payment_id = gateway_payment_id
        self.gateway_signature = gateway_signature
        self.completed_at = timezone.now()
        self.save()

    def mark_failed(self, error_message=''):
        """Mark payment as failed."""
        self.status = 'failed'
        self.metadata['error'] = error_message
        self.save()


class Invoice(models.Model):
    """
    Invoice generated for completed payments.
    """
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name='invoice'
    )
    
    invoice_number = models.CharField(max_length=50, unique=True)
    
    # Billing details
    billing_name = models.CharField(max_length=200)
    billing_email = models.EmailField()
    billing_address = models.TextField(blank=True)
    
    # Tax info (for Indian GST)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # PDF storage
    pdf_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.invoice_number}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            timestamp = timezone.now().strftime('%Y%m%d')
            self.invoice_number = f"INV-{timestamp}-{self.payment.id}"
        super().save(*args, **kwargs)


class Coupon(models.Model):
    """
    Discount coupons for plans.
    """
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Validity
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Usage limits
    max_uses = models.IntegerField(default=0)  # 0 = unlimited
    times_used = models.IntegerField(default=0)
    max_uses_per_user = models.IntegerField(default=1)
    
    # Plan restrictions
    applicable_plans = models.ManyToManyField(
        'plans.Plan',
        blank=True,
        related_name='coupons'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        """Check if coupon is currently valid."""
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_until:
            return False
        if self.max_uses > 0 and self.times_used >= self.max_uses:
            return False
        return True

    def apply_discount(self, amount):
        """Calculate discounted amount."""
        if self.discount_type == 'percentage':
            discount = amount * (self.discount_value / 100)
        else:
            discount = self.discount_value
        return max(0, amount - discount)


class CouponUsage(models.Model):
    """
    Track coupon usage per user.
    """
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='usages'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coupon_usages'
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='coupon_usage'
    )
    
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['coupon', 'payment'], name='unique_coupon_payment')
        ]
