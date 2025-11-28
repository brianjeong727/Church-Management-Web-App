from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Church, Membership, Announcement, Event, Attendance, User
from .serializers import (
    UserSerializer,
    ChurchSerializer,
    AnnouncementSerializer,
    EventSerializer,
    AttendanceSerializer,
    EmailLoginTokenSerializer,
    RegisterChurchSerializer,
    RegisterMemberSerializer,
)
from .permissions import LeadersOnly


# =======================================================
# LOGIN (JWT)
# =======================================================

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailLoginTokenSerializer


# =======================================================
# CHURCH VIEWSET
# =======================================================

class ChurchViewSet(viewsets.ModelViewSet):
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["get"])
    def my_role(self, request, pk=None):
        church = self.get_object()
        membership = Membership.objects.filter(user=request.user, church=church).first()
        return Response({"role": membership.role if membership else None})


# =======================================================
# ANNOUNCEMENT VIEWSET
# =======================================================

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated, LeadersOnly]

    def get_queryset(self):
        user = self.request.user
        membership = Membership.objects.filter(user=user).first()
        if not membership:
            return Announcement.objects.none()

        return Announcement.objects.filter(
            church=membership.church
        ).select_related("church", "created_by")

    def perform_create(self, serializer):
        user = self.request.user
        membership = Membership.objects.filter(user=user).first()
        serializer.save(created_by=user, church=membership.church)


# =======================================================
# EVENT VIEWSET
# =======================================================

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, LeadersOnly]

    def get_queryset(self):
        user = self.request.user
        membership = Membership.objects.filter(user=user).first()
        if not membership:
            return Event.objects.none()

        qs = Event.objects.filter(
            church=membership.church
        ).select_related("church", "created_by")

        if self.request.query_params.get("mine") not in [None, "0"]:
            qs = qs.filter(created_by=user)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        membership = Membership.objects.filter(user=user).first()
        serializer.save(created_by=user, church=membership.church)


# =======================================================
# EVENT ATTENDANCE API (NOT A VIEWSET)
# =======================================================

class EventAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        user = request.user

        # Get event or 404
        event = get_object_or_404(Event, id=event_id)

        # User's membership in church
        membership = Membership.objects.filter(user=user, church=event.church).first()
        if not membership:
            return Response({"error": "Not part of this church"}, status=403)

        # Leaders → return FULL attendance list (flat array)
        if membership.role in ["pastor", "deacon"]:
            rows = Attendance.objects.filter(event=event).select_related("user")
            serializer = AttendanceSerializer(rows, many=True)
            return Response(serializer.data)

        # Members → return ONLY their own record
        record = Attendance.objects.filter(event=event, user=user).first()
        if not record:
            return Response({
                "signed_up": False,
                "status": None,
                "timestamp": None
            })

        return Response({
            "signed_up": True,
            "status": record.status,
            "timestamp": record.timestamp
        })

    def post(self, request, event_id):
        user = request.user

        # ensure event exists
        event = get_object_or_404(Event, id=event_id)

        # ensure user belongs to church
        membership = Membership.objects.filter(user=user, church=event.church).first()
        if not membership:
            return Response({"error": "Not part of this church"}, status=403)

        # Update or create the attendance record
        record, created = Attendance.objects.update_or_create(
            user=user,
            event=event,
            defaults={"status": "in"}
        )

        return Response({"success": True, "status": record.status})


# =======================================================
# REGISTER CHURCH (CREATES CHURCH + PASTOR ACCOUNT)
# =======================================================

class RegisterChurchView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterChurchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


# =======================================================
# REGISTER MEMBER (JOINS EXISTING CHURCH)
# =======================================================

class RegisterMemberView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
