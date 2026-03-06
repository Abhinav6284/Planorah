"""
Django management command to start the AI Mentoring voice WebSocket proxy.

Usage:
    python manage.py run_voice_proxy
    python manage.py run_voice_proxy --port 8001
    python manage.py run_voice_proxy --host 0.0.0.0 --port 8001
"""
import asyncio
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Start the AI Mentoring voice WebSocket proxy server'

    def add_arguments(self, parser):
        parser.add_argument(
            '--host',
            type=str,
            default='localhost',
            help='Host to bind the WebSocket server (default: localhost)',
        )
        parser.add_argument(
            '--port',
            type=int,
            default=8001,
            help='Port for the WebSocket server (default: 8001)',
        )

    def handle(self, *args, **options):
        import os
        os.environ['VOICE_PROXY_HOST'] = options['host']
        os.environ['VOICE_PROXY_PORT'] = str(options['port'])

        self.stdout.write(self.style.SUCCESS(
            f"Starting voice proxy on ws://{options['host']}:{options['port']}"
        ))

        from ai_mentoring.voice_server import main
        asyncio.run(main())
