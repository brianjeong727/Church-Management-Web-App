from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Church, Membership, Announcement, Event, Attendance

class UserSmallSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]

class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = ["id", "name", "location"]

class MembershipSerializer(serializers.ModelSerializer):
    user = UserSmallSerializer(read_only=True)
    class Meta:
        model = Membership
        fields = ["id", "user", "church", "role"]

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by = UserSmallSerializer(read_only=True)
    class Meta:
        model = Announcement
        fields = ["id", "church", "title", "body", "created_by", "created_at"]

class EventSerializer(serializers.ModelSerializer):
    created_by = UserSmallSerializer(read_only=True)
    class Meta:
        model = Event
        fields = ["id", "church", "title", "starts_at", "ends_at", "location", "created_by"]
    def create(self, validated_data):
        if "church" not in validated_data:
            # default to user’s first church
            membership = self.context["request"].user.memberships.first()
            if membership:
                validated_data["church"] = membership.church
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
class AttendanceSerializer(serializers.ModelSerializer):
    user = UserSmallSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "event", "user", "status", "timestamp"]
        read_only_fields = ["user", "timestamp"]

    # Create or update (user,event) upsert
    def create(self, validated_data):
        request = self.context["request"]
        event = validated_data["event"]
        status = validated_data.get("status", "in")
        att, _ = Attendance.objects.update_or_create(
            user=request.user, event=event, defaults={"status": status}
        )
        return att