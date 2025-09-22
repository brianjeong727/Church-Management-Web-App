⛪ Church Management Web Application

A full-stack platform built with Django REST Framework (backend) and React + Vite (frontend) to help churches manage their community. Features include role-based access control, event scheduling, attendance tracking, announcements, and more — all designed with scalability and extensibility in mind.

🚀 Features
Authentication & Roles

JWT-based authentication for secure login/logout.

Role-based access control (Pastor, Deacon, Member).

Leaders can manage events and announcements; members can view and participate.

Announcements

Leaders create, edit, and delete announcements.

Members view announcements in real time.

Events & Attendance

Leaders can create and update events they own.

Members can view events and sign up.

Attendance page provides a table view of who signed up for which event, giving leaders insights into participation.

Extensibility & Scalability

Modular React components for future UI features.

Backend designed to support multi-church scalability.

Cloud-ready with room for real-time notifications, logging, and monitoring.

🛠️ Tech Stack

Frontend

React (Vite, Hooks, Context API)

Axios for API communication

Protected routes and role-based conditional rendering

Backend

Django REST Framework

JWT authentication via djangorestframework-simplejwt

PostgreSQL (or SQLite for local dev)

Custom permission classes for fine-grained role logic
