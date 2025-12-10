---
description: Handling deleted user follow requests
---

# Handling Deleted User Follow Requests

This workflow describes how the system handles follow requests from users who have subsequently deleted their accounts.

## Backend Logic (`server/controllers/userController.js`)

In the `acceptFollowRequest` function:
1.  Attempt to find the requester by ID.
2.  If the requester is not found (returned `null`):
    *   The requester's ID is filtered out of the current user's `followRequests` array.
    *   The current user is saved to persist this cleanup.
    *   A 404 status code is returned with the message: "This user has deleted their account".

## Frontend Logic (`src/pages/Activity.jsx`)

In the `handleAcceptRequest` function:
1.  The API call to accept the request is made.
2.  If the call fails with a 404 status:
    *   An alert is shown to the user with the error message (e.g., "This user has deleted their account").
    *   The request is removed from the local `followRequests` state to update the UI immediately.

In the `handleViewProfile` function:
1.  The API call to fetch the user profile is made.
2.  If the call fails with a 404 status:
    *   An alert is shown: "This user has deleted their account".
