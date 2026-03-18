from django.urls import path
from . import views

urlpatterns = [
    # Subjects
    path('subjects/', views.subject_list, name='planora-subject-list'),
    path('subjects/<int:subject_id>/', views.subject_detail, name='planora-subject-detail'),

    # Syllabus upload + topic generation
    path('subjects/<int:subject_id>/upload-syllabus/', views.upload_syllabus, name='planora-upload-syllabus'),
    path('subjects/<int:subject_id>/generate-topics/', views.generate_topics, name='planora-generate-topics'),

    # Exam pattern
    path('subjects/<int:subject_id>/exam-pattern/', views.exam_pattern, name='planora-exam-pattern'),

    # Topics
    path('subjects/<int:subject_id>/topics/', views.topic_list, name='planora-topic-list'),
    path('topics/<int:topic_id>/', views.topic_detail, name='planora-topic-detail'),
    path('topics/<int:topic_id>/progress/', views.topic_progress, name='planora-topic-progress'),

    # Notes
    path('topics/<int:topic_id>/notes/', views.topic_notes, name='planora-topic-notes'),

    # Study Guide
    path('topics/<int:topic_id>/guide/', views.topic_study_guide, name='planora-topic-study-guide'),

    # Study Planner
    path('subjects/<int:subject_id>/plan/', views.study_plan, name='planora-study-plan'),
]
