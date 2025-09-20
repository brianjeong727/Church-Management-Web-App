# core/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Membership

# canonical role names (lowercase)
LEADER_ROLES = ("pastor", "deacon")

def is_leader_for_church_id(user, church_id):
    if not user or not church_id:
        return False
    return Membership.objects.filter(
        user=user, church_id=church_id, role__in=LEADER_ROLES
    ).exists()

from django.db.models.functions import Lower

def is_leader_for_church_id(user, church_id):
    if not user or not church_id:
        return False
    return Membership.objects.annotate(
        role_lower=Lower("role")
    ).filter(user=user, church_id=church_id, role_lower__in=LEADER_ROLES).exists()


class IsLeaderOrReadOnly(BasePermission):
    """
    Read: any authenticated user
    Create/Update/Delete: only leaders for the target church
    """
    def has_permission(self, request, view):
        # GET/HEAD/OPTIONS must be allowed for authenticated users
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # For POST (create), use church id from the request payload
        if request.method == "POST":
            church_id = request.data.get("church")
            return is_leader_for_church_id(request.user, church_id)

        # For other unsafe list-level actions (rare), allow; object-level will filter
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return is_leader_for_church(request.user, obj.church)

class IsLeaderOwnerOrReadOnly(BasePermission):
    """
    Events:
    - Read: any authenticated user
    - Create: leaders of the target church
    - Update/Delete: leaders AND must be the creator of that event
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        if request.method == "POST":
            church_id = request.data.get("church")
            return is_leader_for_church_id(request.user, church_id)

        # PUT/PATCH/DELETE checked at object level
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        # for edits/deletes, must be leader AND the creator
        return (
            is_leader_for_church(request.user, obj.church)
            and getattr(obj, "created_by_id", None) == request.user.id
        )
