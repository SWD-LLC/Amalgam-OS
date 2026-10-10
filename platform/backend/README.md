# Amalgam Backend Prototype

This directory contains a very simple backend API for the Amalgam Creator Studio
application. The goal of this prototype is to provide a starting point for
implementing the server‑side functionality described in the project specs.
It uses only Node.js core modules to avoid external dependency issues.

## Running the server

```
cd backend
node server.js
```

The server listens on port `3000` by default. You can change the port by
setting the `PORT` environment variable.

## API overview

### Health check

* `GET /api/status` – returns `{ "status": "OK" }` if the server is up.

### Users

* `POST /api/users` – Create a new user. Expects JSON body with
  `email`, `displayName` and optional `role` (defaults to `viewer`). Returns
  the created user object.

* `GET /api/users/{id}` – Fetch a user by their `id`. Returns `404` if the
  user does not exist.

### Streaming sessions

* `POST /api/sessions` – Create a new streaming session. Requires `creatorId`
  and `title` in the JSON body. Additional metadata can be supplied via
  `metadata`.

* `GET /api/sessions/{id}` – Fetch an existing session by its `id`.

* `PUT /api/sessions/{id}` – Update an existing session's `status` or
  `metadata`. The `status` field should reflect the live engine's
  state transitions (`offline`, `preparing`, `going_live`, `live`, `ended`).

### Authentication & payments (stubs)

Routes under `/auth/google` and `/paypal` are stubbed and return `501 Not
Implemented`. They indicate where you should integrate Google SSO and PayPal
REST APIs:

* `GET /auth/google` – Begin Google OAuth flow (unimplemented)
* `GET /auth/google/callback` – Handle Google OAuth callback (unimplemented)
* `POST /paypal/checkout` – Create a PayPal checkout session (unimplemented)
* `POST /paypal/subscription` – Create/manage PayPal subscriptions (unimplemented)
* `POST /paypal/webhook` – Handle PayPal webhook events (unimplemented)
* `POST /paypal/payout` – Initiate a PayPal payout (unimplemented)

## Data persistence

Data is stored as JSON files in the `backend/data` directory. The server
loads these files at startup and writes back any changes. In production you
should replace this mechanism with a proper database (e.g. PostgreSQL,
MongoDB, etc.).

## Configuration

Configuration values (such as OAuth credentials) should be placed in a
separate file. See `config.example.json` for a template. Do **not** commit
your actual credentials into source control.

## Extending the prototype

The current implementation lays down the skeleton for the features required
by the Amalgam Creator Studio:

* **Google SSO** – Add real handlers for `/auth/google` and `/auth/google/callback`.
  Use the OAuth client credentials specified in your configuration to
  authenticate users and create or update `User` records.

* **PayPal integration** – Implement `checkout`, `subscription`, `webhook` and
  `payout` routes using PayPal's REST APIs. Ensure that payment events are
  verified via webhooks before updating entitlements, balances or sessions.

* **Data models** – The `users.json`, `sessions.json` and `orders.json` files
  are simple arrays. You can extend the data model to include creator
  profiles, boost credit wallets, revenue ledgers and more. See the project
  specification for details on required fields.

* **Security** – Implement proper session handling and authentication for
  protected routes. Use secure cookies or tokens to manage logged in users.
  Add input validation and sanitisation.

* **Streaming backend** – The current server does not handle RTMP ingest,
  restreaming or WebRTC. Integrating a real streaming backend will require
  additional services (e.g. nginx‑rtmp, Janus) and is beyond the scope of
  this prototype.

Feel free to build on top of this foundation. It is intentionally kept
simple so you can adapt it to your needs.