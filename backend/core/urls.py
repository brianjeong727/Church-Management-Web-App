from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ChurchViewSet,
    AnnouncementViewSet,
    EventViewSet,
    AttendanceViewSet,
    MyTokenObtainPairView,   # ← login
    signup,                  # ← signup
)

router = DefaultRouter()
router.register("churches", ChurchViewSet)
router.register("announcements", AnnouncementViewSet)
router.register("events", EventViewSet)
router.register("attendance", AttendanceViewSet)

urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("signup/", signup, name="signup"),
    path("", include(router.urls)),
]
