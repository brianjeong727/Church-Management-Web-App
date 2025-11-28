from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# ======================================================
# CUSTOM USER MODEL
# ======================================================

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)

    full_name = models.CharField(max_length=100, blank=True, null=True)

    # Django-required flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # email + password only

    def __str__(self):
        return self.email


# ======================================================
# CHURCH MODEL
# ======================================================

class Church(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    denomination = models.CharField(max_length=100, blank=True, null=True)
    size = models.IntegerField(blank=True, null=True)  # optional

    def __str__(self):
        return self.name


# ======================================================
# MEMBERSHIP MODEL — User belongs to a Church with a Role
# ======================================================

class Membership(models.Model):

    ROLE_CHOICES = [
        ("pastor", "Pastor"),
        ("deacon", "Deacon"),
        ("member", "Member"),
    ]

    user = models.ForeignKey("core.User", on_delete=models.CASCADE, related_name="memberships")
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="memberships")

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")

    class Meta:
        unique_together = ("user", "church")

    def __str__(self):
        return f"{self.user.email} @ {self.church.name} ({self.role})"


# ======================================================
# ANNOUNCEMENTS (belongs to a Church)
# ======================================================

class Announcement(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="announcements")
    title = models.CharField(max_length=200)
    body = models.TextField()

    created_by = models.ForeignKey("core.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.church.name})"


# ======================================================
# EVENTS (belongs to a Church)
# ======================================================

class Event(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=200)

    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()

    location = models.CharField(max_length=200, blank=True)

    created_by = models.ForeignKey("core.User", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.title} ({self.church.name})"


# ======================================================
# ATTENDANCE — User checks in/out of an Event
# ======================================================

class Attendance(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="attendances")
    user = models.ForeignKey("core.User", on_delete=models.CASCADE)

    status = models.CharField(
        max_length=20,
        choices=[
            ("in", "Checked In"),
            ("out", "Checked Out"),
        ]
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.user.email} → {self.event.title} ({self.status})"
