from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_resume, name='generate-resume'),
    path('list/', views.get_resumes, name='list-resumes'),
    path('<int:pk>/', views.get_resume_detail, name='resume-detail'),
    path('<int:pk>/update/', views.update_resume, name='update-resume'),
    path('<int:pk>/delete/', views.delete_resume, name='delete-resume'),
    path('import/', views.import_resume, name='import-resume'),
    path('analyze-ats/', views.analyze_ats, name='analyze-ats'),
]

