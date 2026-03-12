from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import CustomUser


class Command(BaseCommand):
    help = "Delete pending users older than the configured TTL (default: 15 minutes)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--minutes",
            type=int,
            default=15,
            help="Delete users older than this many minutes in pending state.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print affected user count without deleting records.",
        )

    def handle(self, *args, **options):
        minutes = max(1, options["minutes"])
        dry_run = options["dry_run"]

        cutoff = timezone.now() - timedelta(minutes=minutes)
        pending_qs = CustomUser.objects.filter(
            status=CustomUser.STATUS_PENDING,
            created_at__lt=cutoff,
        )
        pending_count = pending_qs.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"[DRY RUN] {pending_count} pending users older than {minutes} minutes would be deleted."
                )
            )
            return

        if pending_count == 0:
            self.stdout.write(self.style.SUCCESS("No stale pending users found."))
            return

        deleted_rows, _ = pending_qs.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {pending_count} pending users older than {minutes} minutes "
                f"({deleted_rows} rows including related records)."
            )
        )
