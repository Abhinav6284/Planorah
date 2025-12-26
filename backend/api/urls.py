from django.urls import path
from . import views
from . import jobs

urlpatterns = [
   path('hello/', views.hello_world),
   path('jobs/search/', jobs.search_jobs, name='search_jobs'),
]