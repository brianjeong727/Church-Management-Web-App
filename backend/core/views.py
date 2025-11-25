from rest_framework import viewsets, permissions as drf_permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Church, Membership, Announcement, Event, Attendance, User
from .serializers import (
    ChurchSerializer,
    MembershipSerializer,
    AnnouncementSerializer,
    EventSerializer,
    AttendanceSerializer,
    EmailLoginTokenSerializer,
)
from .permissions import IsLeaderOrReadOnly, IsLeaderOwnerOrReadOnly, LEADER_ROLES

from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView


# ----------------------------------------------------
# LOGIN (JWT)
# ----------------------------------------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailLoginTokenSerializer


# ----------------------------------------------------
# SIGNUP
# ----------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    email = request.data.get("email")
    full_name = request.data.get("full_name")
    password = request.data.get("password")
    church_id = request.data.get("church_id")
    role = request.data.get("role", "member").lower()

    if not email or not password or not church_id:
        return Response({"error": "Missing required fields"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already in use"}, status=400)

    church = get_object_or_404(Church, id=church_id)

    user = User.objects.create_user(
        email=email,
        password=password,
        full_name=full_name,
    )

    Membership.objects.create(
        user=user,
        church=church,
        role=role,
    )

    return Response({"message": "Account created"}, status=201)



# ----------------------------------------------------
# CHURCHES
# ----------------------------------------------------
class ChurchViewSet(viewsets.ModelViewSet):
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [drf_permissions.IsAuthenticated()]

    @action(detail=True, methods=["get"])
    def my_role(self, request, pk=None):
        church = self.get_object()
        m = Membership.objects.filter(user=request.user, church=church).first()
        return Response({"role": m.role if m else None})



# ----------------------------------------------------
# ANNOUNCEMENTS
# ----------------------------------------------------
class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.select_related("church", "created_by").order_by("-created_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsLeaderOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)



# ----------------------------------------------------
# EVENTS
# ----------------------------------------------------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("church", "created_by").order_by("-starts_at")
    serializer_class = EventSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsLeaderOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get("mine")
        if mine and mine != "0":
            qs = qs.filter(created_by=self.request.user)
        return qs



# ----------------------------------------------------
# ATTENDANCE
# ----------------------------------------------------
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("event", "user").order_by("-timestamp")
    serializer_class = AttendanceSerializer
    permission_classes = [drf_permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()

        event_id = self.request.query_params.get("event")

        if event_id:
            qs = qs.filter(event_id=event_id)
            event = Event.objects.filter(id=event_id).select_related("church").first()

            if event:
                membership = Membership.objects.filter(
                    user=self.request.user,
                    church=event.church
                ).first()

                if not (membership and membership.role in LEADER_ROLES):
                    qs = qs.filter(user=self.request.user)

        else:
            qs = qs.filter(user=self.request.user)

        return qs

    def perform_create(self, serializer):
        serializer.save()
