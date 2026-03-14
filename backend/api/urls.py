from django.urls import path
from . import views
from . import jobs

urlpatterns = [
   path('hello/', views.hello_world),
   path('support/tickets/', views.create_support_ticket, name='support_ticket_create'),
   path('jobs/search/', jobs.search_jobs, name='search_jobs'),
]
