from rest_framework import viewsets, permissions as drf_permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Prefetch
from .models import Church, Membership, Announcement, Event, Attendance
from .serializers import (
    ChurchSerializer, MembershipSerializer, AnnouncementSerializer, EventSerializer, AttendanceSerializer
)
from .permissions import IsLeaderOrReadOnly, IsLeaderOwnerOrReadOnly, LEADER_ROLES

class ChurchViewSet(viewsets.ModelViewSet):
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer
    permission_classes = [drf_permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def my_role(self, request, pk=None):
        church = self.get_object()
        m = Membership.objects.filter(user=request.user, church=church).first()
        return Response({'role': m.role if m else None})

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.select_related("church","created_by").order_by("-created_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsLeaderOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("church","created_by").order_by("-starts_at")
    serializer_class = EventSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsLeaderOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        # ?mine=1 to see only your created events (leaders)
        mine = self.request.query_params.get("mine")
        if mine and mine != "0":
            qs = qs.filter(created_by=self.request.user)
        return qs

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("event","user").order_by("-timestamp")
    serializer_class = AttendanceSerializer
    permission_classes = [drf_permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        # Members can see their own attendance rows; leaders see all.
        # Determine role from event’s church using any event row (best-effort)
        if event_id:
            event = Event.objects.filter(id=event_id).select_related("church").first()
            if event:
                m = Membership.objects.filter(user=self.request.user, church=event.church).first()
                if not (m and m.role in LEADER_ROLES):
                    qs = qs.filter(user=self.request.user)
        else:
            # No event filter → only own rows unless leader on any of those events’ churches
            qs = qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        # user comes from serializer.create()
        serializer.save()