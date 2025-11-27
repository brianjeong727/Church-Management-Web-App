from django.db.models.functions import Lower
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Membership

LEADER_ROLES = ("pastor", "deacon")


class LeadersOnly(BasePermission):
    message = "Only pastors and deacons in this church can perform this action."

    def has_permission(self, request, view):
        # READ allowed for authenticated users
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # For WRITES, user must be a leader in *their* church
        membership = Membership.objects.annotate(
            rl=Lower("role")
        ).filter(
            user=request.user,
            rl__in=LEADER_ROLES
        ).first()

        return membership is not None

    def has_object_permission(self, request, view, obj):
        # READ always allowed
        if request.method in SAFE_METHODS:
            return True

        membership = Membership.objects.annotate(
            rl=Lower("role")
        ).filter(
            user=request.user,
            church=obj.church,
            rl__in=LEADER_ROLES
        ).first()

        return membership is not None
