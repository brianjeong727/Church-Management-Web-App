from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Church, Membership, Announcement, Event, Attendance

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ("email", "full_name", "is_staff", "is_superuser")
    list_filter = ("is_staff", "is_superuser", "is_active")

    ordering = ("email",)
    search_fields = ("email",)

    # fields visible when editing a user
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )

    # fields visible when creating a user
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "full_name", "is_staff", "is_superuser"),
        }),
    )

admin.site.register(User, UserAdmin)
admin.site.register(Church)
admin.site.register(Membership)
admin.site.register(Announcement)
admin.site.register(Event)
admin.site.register(Attendance)
