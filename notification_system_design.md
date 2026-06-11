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

## Database Schema

### notifications

Stores individual notifications for users.

| Column     | Type         | Description                  |
| ---------- | ------------ | ---------------------------- |
| id         | UUID         | Notification identifier      |
| user_id    | UUID         | Owner of notification        |
| type       | VARCHAR(50)  | Notification category        |
| title      | VARCHAR(255) | Notification title           |
| message    | TEXT         | Notification content         |
| read       | BOOLEAN      | Read status                  |
| priority   | VARCHAR(20)  | LOW, MEDIUM, HIGH            |
| action_url | VARCHAR(500) | Optional redirect URL        |
| metadata   | JSONB        | Additional notification data |
| created_at | TIMESTAMP    | Creation timestamp           |
| read_at    | TIMESTAMP    | Read timestamp               |

### notification_preferences

Stores user notification settings.

| Column            | Type      | Description             |
| ----------------- | --------- | ----------------------- |
| user_id           | UUID      | User identifier         |
| email_enabled     | BOOLEAN   | Email notifications     |
| push_enabled      | BOOLEAN   | Push notifications      |
| sms_enabled       | BOOLEAN   | SMS notifications       |
| marketing_enabled | BOOLEAN   | Marketing notifications |
| updated_at        | TIMESTAMP | Last update timestamp   |

---

## Recommended Indexes

Since most requests are user-specific, the following indexes would be useful:

* (user_id, created_at)
* (user_id, read)
* (created_at)

These indexes support:

* Notification listing
* Unread count queries
* Read/unread filtering
* Recent notification retrieval

---

## Queries for Stage 1 APIs

### Retrieve Notifications

Returns the latest notifications for a user.

```sql
SELECT *
FROM notifications
WHERE user_id = :userId
ORDER BY created_at DESC
LIMIT :limit
OFFSET :offset;
```

### Retrieve Unread Notifications

```sql
SELECT *
FROM notifications
WHERE user_id = :userId
AND read = FALSE
ORDER BY created_at DESC;
```

### Retrieve Unread Count

```sql
SELECT COUNT(*)
FROM notifications
WHERE user_id = :userId
AND read = FALSE;
```

### Mark Notification as Read

```sql
UPDATE notifications
SET read = TRUE,
    read_at = NOW()
WHERE id = :notificationId
AND user_id = :userId;
```

### Mark All Notifications as Read

```sql
UPDATE notifications
SET read = TRUE,
    read_at = NOW()
WHERE user_id = :userId
AND read = FALSE;
```

### Delete Notification

```sql
DELETE FROM notifications
WHERE id = :notificationId
AND user_id = :userId;
```

### Retrieve Notification Preferences

```sql
SELECT *
FROM notification_preferences
WHERE user_id = :userId;
```

### Update Notification Preferences

```sql
UPDATE notification_preferences
SET email_enabled = :emailEnabled,
    push_enabled = :pushEnabled,
    sms_enabled = :smsEnabled,
    marketing_enabled = :marketingEnabled,
    updated_at = NOW()
WHERE user_id = :userId;
```

---

## Scaling Challenges

As the number of users and notifications grows, several challenges may appear.

### Large Notification Tables

A system generating millions of notifications per day can result in very large tables. Query performance may degrade even with indexes.

**Solution**

* Partition notifications by creation date
* Archive old notifications
* Apply retention policies for expired records

---

### Slow Unread Count Queries

Counting unread notifications for every page load can become expensive.

**Solution**

* Cache unread counts in Redis
* Update the cache whenever a notification is created or marked as read

---

### High Write Traffic

A spike in notification generation can overload the database.

**Solution**

* Use a message queue such as Kafka or RabbitMQ
* Notification producers publish events
* Background workers persist notifications asynchronously

---

### Real-Time Delivery at Scale

Maintaining thousands of WebSocket connections on a single application server may become difficult.

**Solution**

* Use a dedicated WebSocket layer
* Store active connection information in Redis
* Use pub/sub mechanisms to distribute notification events

---