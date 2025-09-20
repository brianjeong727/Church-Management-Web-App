from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChurchViewSet, AnnouncementViewSet, EventViewSet, AttendanceViewSet

router = DefaultRouter()
router.register('churches', ChurchViewSet)
router.register('announcements', AnnouncementViewSet)
router.register('events', EventViewSet)
router.register('attendance', AttendanceViewSet)

urlpatterns = [ path('', include(router.urls)), ]
