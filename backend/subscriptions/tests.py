from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from users.models import CustomUser
from plans.models import Plan
from subscriptions.models import Subscription


class StaffMaxSubscriptionTests(TestCase):
    def setUp(self):
        Plan.create_default_plans()

    def test_staff_user_gets_max_subscription(self):
        staff = CustomUser.objects.create_user(
            email="admin@planorah.test",
            username="admin",
            password="pw",
            is_staff=True,
            is_active=True,
            is_verified=True,
            status="active",
        )

        sub = Subscription.get_active_subscription(staff)
        self.assertIsNotNone(sub)
        self.assertEqual(sub.status, "active")

        max_plan = Plan.objects.filter(is_active=True).order_by("-price_inr", "-id").first()
        self.assertIsNotNone(max_plan)
        self.assertEqual(sub.plan_id, max_plan.id)

        # Should be effectively non-expiring for staff.
        self.assertGreater(sub.end_date, timezone.now() + timedelta(days=30000))

        # Calling again should not create duplicates.
        sub2 = Subscription.get_active_subscription(staff)
        self.assertEqual(sub2.id, sub.id)
        self.assertEqual(Subscription.objects.filter(user=staff).count(), 1)

    def test_non_staff_user_with_no_subscription_returns_none(self):
        user = CustomUser.objects.create_user(
            email="user@planorah.test",
            username="user",
            password="pw",
            is_staff=False,
            is_active=True,
            is_verified=True,
            status="active",
        )

        self.assertIsNone(Subscription.get_active_subscription(user))
