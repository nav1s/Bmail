# API Routes Documentation

This document outlines the available API endpoints for the application, grouped by resource.

---

## Blacklist Routes

- **POST** `/api/blacklist`
    - Description: Adds a list of urls to the blacklist.
    - Auth: Required

- **DELETE** `/api/blacklist/:id`
    - Description: Removes a list of urls from the blacklist.
    - Auth: Required

---

## Labels Routes

- **GET** `/api/labels`
    - Description: Returns all labels for the authenticated user.
    - Auth: Required

- **POST** `/api/labels`
    - Description: Creates a new label for the authenticated user.
    - Auth: Required

- **GET** `/api/labels/:id`
    - Description: Returns a label by its ID.
    - Auth: Required

- **PATCH** `/api/labels/:id`
    - Description: Updates a label by its ID.
    - Auth: Required

- **DELETE** `/api/labels/:id`
    - Description: Deletes a label by its ID.
    - Auth: Required

---

## Mails Routes

- **GET** `/api/mails`
    - Description: Returns the last 50 mails sent/received by the user.
    - Auth: Required

- **GET** `/api/mails/byLabel/:label`
    - Description: Returns the last 50 mails filtered by label.
    - Auth: Required

- **POST** `/api/mails`
    - Description: Sends a new mail.
    - Auth: Required

- **POST** `/api/mails/:mailId/labels`
    - Description: Attaches a label to a mail.
    - Auth: Required

- **DELETE** `/api/mails/:mailId/labels/:labelId`
    - Description: Removes a label from a mail.
    - Auth: Required

- **GET** `/api/mails/search/:query`
    - Description: Searches mails by query.
    - Auth: Required

- **GET** `/api/mails/:id`
    - Description: Returns a mail by ID.
    - Auth: Required

- **PATCH** `/api/mails/:id`
    - Description: Updates a mail by ID.
    - Auth: Required

- **DELETE** `/api/mails/:id`
    - Description: Deletes a mail by ID.
    - Auth: Required

---

## Tokens Routes

- **POST** `/api/tokens`
    - Description: Logs in a user.

---

## Users Routes

- **POST** `/api/users`
    - Description: Creates a new user, optionally with an image file.

- **GET** `/api/users/username/:username`
    - Description: Gets a user by username, also returns path of image file if it exists.

- **GET** `/api/users/:id`
    - Description: Gets a user by their ID.

- **PATCH** `/api/users`
    - Description: Updates a user by ID, optionally with an image.
    - Auth: Required

---