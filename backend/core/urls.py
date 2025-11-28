from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ChurchViewSet,
    AnnouncementViewSet,
    EventViewSet,
    MyTokenObtainPairView,
    RegisterChurchView,
    RegisterMemberView,
    EventAttendanceView,   # <-- normal APIView, NOT in router
)

router = DefaultRouter()
router.register("churches", ChurchViewSet)
router.register("announcements", AnnouncementViewSet)
router.register("events", EventViewSet)

urlpatterns = [
    # LOGIN
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # SIGNUP
    path("auth/register_church/", RegisterChurchView.as_view(), name="register_church"),
    path("auth/register_member/", RegisterMemberView.as_view(), name="register_member"),

    # ATTENDANCE (normal APIView, NOT router)
    path("events/<int:event_id>/attendance/", EventAttendanceView.as_view()),

    # ROUTER
    path("", include(router.urls)),
]
