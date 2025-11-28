from rest_framework import serializers
from .models import User, Church, Membership, Announcement, Event, Attendance
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# ======================================================
# USER / CHURCH / MEMBERSHIP SERIALIZERS
# ======================================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name"]


class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = ["id", "name", "location", "denomination", "size"]


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    church = ChurchSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "church", "role"]


# ======================================================
# ANNOUNCEMENT SERIALIZER
# ======================================================

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Announcement
        fields = ["id", "church", "title", "body", "created_by", "created_at"]
        read_only_fields = ["church", "created_by"]

    def create(self, validated_data):
        user = self.context["request"].user

        membership = Membership.objects.filter(user=user).first()
        if not membership:
            raise serializers.ValidationError(
                {"error": "You must belong to a church to create announcements."}
            )

        validated_data["church"] = membership.church
        validated_data["created_by"] = user

        return super().create(validated_data)


# ======================================================
# EVENT SERIALIZER
# ======================================================

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
        read_only_fields = ["church", "created_by"]

    def create(self, validated_data):
        user = self.context["request"].user

        membership = Membership.objects.filter(user=user).first()
        if not membership:
            raise serializers.ValidationError(
                {"error": "You must belong to a church to create an event."}
            )

        validated_data["church"] = membership.church
        validated_data["created_by"] = user

        return super().create(validated_data)


# ======================================================
# ATTENDANCE SERIALIZER
# ======================================================

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

        attendance, created = Attendance.objects.update_or_create(
            user=user,
            event=event,
            defaults={"status": status}
        )
        return attendance


class EventAttendanceListSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True, read_only=True)
    total_attendees = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ["id", "title", "starts_at", "ends_at", "attendances", "total_attendees"]

    def get_total_attendees(self, obj):
        return obj.attendances.count()



# ======================================================
# EMAIL LOGIN SERIALIZER (SimpleJWT)
# ======================================================

class EmailLoginTokenSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
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


# ======================================================
# REGISTER CHURCH SERIALIZER
# ======================================================

class RegisterChurchSerializer(serializers.Serializer):
    church_name = serializers.CharField()
    location = serializers.CharField(required=False, allow_blank=True)
    denomination = serializers.CharField(required=False, allow_blank=True)
    size = serializers.IntegerField(required=False)

    full_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A pastor account already exists for this email. "
                "Pastors may only register one church."
            )
        return value

    def create(self, validated_data):
        # Extract church fields
        church = Church.objects.create(
            name=validated_data["church_name"],
            location=validated_data.get("location", ""),
            denomination=validated_data.get("denomination", ""),
            size=validated_data.get("size")
        )

        # Create the pastor user
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
        )

        # Create membership (pastor)
        Membership.objects.create(
            user=user,
            church=church,
            role="pastor"
        )

        return user



# ======================================================
# REGISTER MEMBER SERIALIZER
# ======================================================

class RegisterMemberSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    church_id = serializers.IntegerField()

    def create(self, validated_data):
        church = Church.objects.get(id=validated_data["church_id"])

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
        )

        Membership.objects.create(
            user=user,
            church=church,
            role="member"
        )

        return user