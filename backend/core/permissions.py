from django.db.models.functions import Lower
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Membership

LEADER_ROLES = ("pastor", "deacon")


class LeadersOnly(BasePermission):
    """
    Only pastors and deacons of the church can create/update/delete.
    READ operations are allowed for any authenticated member.
    """

    message = "Only pastors and deacons can perform this action."

    def _get_membership(self, request, obj=None):
        """
        Helper method that pulls the user's membership.
        If obj is provided, restrict to that object's church.
        """
        qs = Membership.objects.annotate(role_lower=Lower("role")).filter(
            user=request.user
        )

        if obj is not None:
            qs = qs.filter(church=obj.church)

        return qs.first()

    def has_permission(self, request, view):
        # Must be logged in
        if not request.user.is_authenticated:
            return False

        # SAFE methods (GET, HEAD, OPTIONS) allowed for any authenticated member
        if request.method in SAFE_METHODS:
            return True

        # WRITE: must be a leader
        membership = self._get_membership(request)
        return membership and membership.role.lower() in LEADER_ROLES

    def has_object_permission(self, request, view, obj):
        # SAFE methods allowed always
        if request.method in SAFE_METHODS:
            return True

        membership = self._get_membership(request, obj=obj)
        return membership and membership.role.lower() in LEADER_ROLES
