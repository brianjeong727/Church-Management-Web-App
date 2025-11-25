# core/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.db.models.functions import Lower
from .models import Membership

# Canonical lowercase role names
LEADER_ROLES = ("pastor", "deacon")


# -------- Helper Functions -------- #

def is_leader_for_church_id(user, church_id):
    """
    Returns True if user is a pastor/deacon for the given church_id.
    """
    if not user or not church_id:
        return False

    return Membership.objects.annotate(
        role_lower=Lower("role")
    ).filter(
        user=user,
        church_id=church_id,
        role_lower__in=LEADER_ROLES
    ).exists()


def is_leader_for_church(user, church_obj):
    """
    Same as above but takes a church object instead of ID.
    """
    if not church_obj:
        return False
    return is_leader_for_church_id(user, church_obj.id)


# -------- Permission Classes -------- #

class IsLeaderOrReadOnly(BasePermission):
    """
    For Announcements:
    - Read: any authenticated user
    - Create: only leaders of that church
    - Update/Delete: only leaders of that church
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        if request.method == "POST":
            church_id = request.data.get("church")
            return is_leader_for_church_id(request.user, church_id)

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return is_leader_for_church(request.user, obj.church)


class IsLeaderOwnerOrReadOnly(BasePermission):
    """
    For Events:
    - Read: any authenticated user
    - Create: leader of church
    - Update/Delete: leader AND event creator
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        if request.method == "POST":
            church_id = request.data.get("church")
            return is_leader_for_church_id(request.user, church_id)

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return (
            is_leader_for_church(request.user, obj.church)
            and obj.created_by_id == request.user.id
        )
