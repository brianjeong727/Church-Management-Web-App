from rest_framework import serializers
from .models import User, Church, Membership, Announcement, Event, Attendance


# ---------------------------
# USER / CHURCH / MEMBERSHIP
# ---------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name"]


class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = ["id", "name", "location"]


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    church = ChurchSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "church", "role"]


# ---------------------------
# ANNOUNCEMENTS
# ---------------------------
class AnnouncementSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Announcement
        fields = ["id", "church", "title", "body", "created_by", "created_at"]


# ---------------------------
# EVENTS
# ---------------------------
class EventSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "church",
            "title",
            "starts_at",
            "ends_at",
            "location",
            "created_by",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


# ---------------------------
# ATTENDANCE
# ---------------------------
class AttendanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "event", "user", "status", "timestamp"]
        read_only_fields = ["user", "timestamp"]

    def create(self, validated_data):
        user = self.context["request"].user
        event = validated_data["event"]
        status = validated_data.get("status", "in")
        record, _ = Attendance.objects.update_or_create(
            user=user, event=event, defaults={"status": status}
        )
        return record


# ---------------------------
# SIGNUP
# ---------------------------
class SignupSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    church_id = serializers.IntegerField()
    role = serializers.CharField()

    def create(self, validated_data):
        email = validated_data["email"]
        
        # check duplicate
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already exists"})

        from .models import Church
        church = Church.objects.get(id=validated_data["church_id"])
        role = validated_data.get("role", "member").lower()

        user = User.objects.create_user(
            email=email,
            full_name=validated_data.get("full_name", ""),
            password=validated_data["password"],
        )

        Membership.objects.create(
            user=user,
            church=church,
            role=role,
        )

        return user


# ---------------------------
# LOGIN USING EMAIL
# ---------------------------

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Membership

class EmailLoginTokenSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        print("🔥🔥 CUSTOM SERIALIZER IS BEING USED 🔥🔥")

        attrs["username"] = attrs.get("email")
        data = super().validate(attrs)

        user = self.user
        membership = Membership.objects.filter(user=user).first()

        data["user"] = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": membership.role if membership else None,
            "church": membership.church.name if membership else None,
            "church_id": membership.church.id if membership else None,
        }

        return data
