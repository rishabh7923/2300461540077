# Notification System Design

### Core Actions Supported

1. View notifications
2. View unread notification count
3. Mark a notification as read
4. Mark all notifications as read
5. Delete a notification
6. Manage notification preferences
7. Receive real-time notifications

---

## Notification Structure

Each notification should contain the following information:

| Field     | Description                                            |
| --------- | ------------------------------------------------------ |
| id        | Unique notification identifier                         |
| type      | Notification category (Order, Payment, Security, etc.) |
| title     | Short notification title                               |
| message   | Notification content                                   |
| read      | Indicates whether the notification has been viewed     |
| createdAt | Timestamp of creation                                  |
| actionUrl | Optional link associated with the notification         |

---

## API Endpoints

### Retrieve Notifications

**GET /api/v1/notifications**

Returns a paginated list of notifications for the logged-in user.

Supported filters:

* page
* limit
* unreadOnly

---

### Retrieve Unread Count

**GET /api/v1/notifications/unread-count**

Returns the total number of unread notifications.

This endpoint allows the frontend to display notification badges without loading the full notification list.

---

### Mark a Notification as Read

**PATCH /api/v1/notifications/{notificationId}/read**

Updates a single notification's status to read.

---

### Mark All Notifications as Read

**PATCH /api/v1/notifications/read-all**

Updates all unread notifications belonging to the current user.

---

### Delete a Notification

**DELETE /api/v1/notifications/{notificationId}**

Removes a notification from the user's notification center.

---

### Get Notification Preferences

**GET /api/v1/notification-preferences**

Returns the current notification settings configured by the user.

Example preferences include:

* Email notifications
* Push notifications
* SMS notifications
* Marketing notifications
* In-app notifications

---

### Update Notification Preferences

**PUT /api/v1/notification-preferences**

Allows users to update their notification settings.

---

## Authentication and Headers

All endpoints require authentication using a bearer token.

Required request headers:

| Header        | Purpose             |
| ------------- | ------------------- |
| Authorization | User authentication |
| Content-Type  | Request format      |
| Accept        | Response format     |

The API should return responses using a consistent JSON structure and standard HTTP status codes.

---

## Real-Time Notification Delivery

For real-time updates, WebSockets are recommended.

### Connection Endpoint

`/ws/notifications`

When a new notification is created, the server immediately pushes the notification to all active sessions belonging to that user.

Benefits of WebSockets:

* Instant delivery
* Lower latency
* Reduced polling traffic
* Better user experience

If WebSockets are unavailable, Server-Sent Events (SSE) can be used as a fallback mechanism for one-way server-to-client updates.