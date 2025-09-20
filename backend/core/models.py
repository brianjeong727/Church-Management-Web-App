from django.db import models
from django.contrib.auth.models import User


class Church(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    def __str__(self): return self.name


class Membership(models.Model):
    ROLE_CHOICES = [
        ('pastor', 'Pastor'),
        ('deacon', 'Deacon'),
        ('member', 'Member'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    church = models.ForeignKey(Church, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    class Meta:
        unique_together = ('user', 'church')


class Announcement(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Event(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)


class Attendance(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[('in','Checked In'),('out','Checked Out')])
    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-timestamp']
