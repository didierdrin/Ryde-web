# IremboPay (Inline Widget) Integration — `ryde-web`

This doc explains how `ryde-web` integrates **IremboPay Inline Widget** and what your **backend must provide** if you want to reuse this exact approach in another website.

## What’s implemented (high level)

- **Frontend** loads the IremboPay inline widget script into the browser.
- When a user clicks **Pay**, the frontend calls the backend to **create/get an invoice number**.
- Frontend opens the payment modal via `window.IremboPay.initiate({ publicKey, invoiceNumber, ... })`.
- After the modal returns, the frontend **polls** the backend until the payment becomes **COMPLETED** (or **FAILED**).
- Payment status is finalized **server-side** from an IremboPay webhook flow (in this repo the webhook is forwarded/verified by an external callbacks service, then posted into the backend).

## Frontend configuration (`.env.example`)

File: `ryde-web/.env.example`

```dotenv
# Backend API (use Railway URL for local dev against hosted API, or localhost for local backend)
REACT_APP_API_URL=http://localhost:3000/api

# IremboPay widget (public key pk_… from dashboard; must match IREMBOPAY_ENVIRONMENT — use sandbox key with sandbox inline script)
REACT_APP_IPAY_PUBLIC_KEY=pk_sandbox_your_public_key
```

- **`REACT_APP_API_URL`**: Base URL for your backend, including `/api`.
- **`REACT_APP_IPAY_PUBLIC_KEY`**: The **public key** from IremboPay dashboard (starts with `pk_...`). This is safe to expose to the browser.

## Where the widget script is loaded

File: `ryde-web/public/index.html`

The repo currently loads the **sandbox** widget script:

- `https://dashboard.sandbox.irembopay.com/assets/payment/inline.js`

For other environments, swap the script src:

- **checkout**: `https://dashboard.checkout.irembopay.com/assets/payment/inline.js`
- **production**: `https://dashboard.irembopay.com/assets/payment/inline.js`

Important: the **script environment** and your **public key environment** must match (sandbox key with sandbox script, production key with production script, etc.).

## Frontend usage (how payment is started)

### Trips payment flow

File: `ryde-web/src/pages/Trips.js`

Key logic:

- Reads public key from env: `process.env.REACT_APP_IPAY_PUBLIC_KEY`
- Calls backend to get current trip payment record
- Calls backend to create an IremboPay invoice number for that payment
- Opens widget with `window.IremboPay.initiate(...)`
- Polls backend until payment status updates

The backend calls made are:

- `GET /payments/trip/:tripId`
- `POST /payments/:paymentId/create-invoice`
- Repeat `GET /payments/trip/:tripId` until `payment.payment_status` becomes `COMPLETED` or `FAILED`

### Rentals / arbitrary amount flow

File: `ryde-web/src/pages/Rentals.js`

Key logic:

- Creates an invoice for an arbitrary `amount`
- Opens widget with `invoiceNumber`
- Polls a “rental intent” status endpoint until `COMPLETED` / `FAILED`

The backend calls made are:

- `POST /payments/create-invoice-for-amount` with JSON body `{ amount, address?, vehicleRef? }`
- `GET /payments/rental-intent/:intentId` (polling)

## Backend API contract (what your other backend must implement)

Your other website can reuse the same frontend pattern if your backend exposes endpoints that match this contract (names can differ, but the behavior should match).

### 1) Get a trip payment record

**Request**

- `GET /api/payments/trip/:tripId` (authenticated)

**Response (example)**

```json
{
  "payment": {
    "payment_id": "uuid-or-string",
    "trip_id": "uuid-or-string",
    "amount": 5000,
    "payment_status": "PENDING",
    "invoice_number": null
  }
}
```

Frontend expects at least:

- `payment.payment_id`
- `payment.payment_status` in `{ PENDING, COMPLETED, FAILED }` (this repo uses those values)

### 2) Create an IremboPay invoice for a trip payment

**Request**

- `POST /api/payments/:paymentId/create-invoice` (authenticated)

**Response**

```json
{ "invoiceNumber": "INV-XXXXXX", "paymentId": "..." }
```

Rules:

- Only create invoices for **PENDING** payments.
- Persist the `invoiceNumber` on the payment record so later webhook updates can match it.

### 3) Create an IremboPay invoice for an arbitrary amount (rentals, etc.)

**Request**

- `POST /api/payments/create-invoice-for-amount` (authenticated)
- Body:

```json
{ "amount": 35000, "address": "optional string", "vehicleRef": "optional string" }
```

**Response**

```json
{ "invoiceNumber": "INV-XXXXXX", "intentId": "uuid-or-string" }
```

Rules:

- Create an internal “payment intent” record with `status=PENDING`.
- Persist `invoiceNumber` on the intent record.

### 4) Poll rental intent status

**Request**

- `GET /api/payments/rental-intent/:intentId` (authenticated)

**Response**

```json
{
  "intent": {
    "intentId": "uuid-or-string",
    "amount": 35000,
    "status": "PENDING",
    "invoiceNumber": "INV-XXXXXX",
    "vehicleRef": "optional"
  }
}
```

Frontend expects:

- `intent.status` in `{ PENDING, COMPLETED, FAILED }`

## Backend responsibilities (how status becomes COMPLETED)

This repo’s backend creates invoices server-side using the secret key (via `@irembo/irembopay-node-sdk`) and then relies on a webhook flow to update local records:

- When IremboPay marks an invoice as paid/failed, your backend must receive a callback and:
  - Find the local payment/intent by `invoiceNumber`
  - Mark it `COMPLETED` or `FAILED`

In this repo:

- Invoice creation is implemented in `ryde-backend/services/irembopayService.js`
- Webhook-forwarded subscription handler is `POST /api/orders/subscribe` (implemented as `paymentSubscribe` in `ryde-backend/controllers/paymentController.js`)

If you’re implementing your own backend elsewhere, you can:

- **Option A (recommended)**: receive IremboPay webhooks directly (verify signature per IremboPay docs), then update your DB.
- **Option B**: use a forwarding/verification service (like this repo’s setup) and accept only trusted internal calls.

Either way, the frontend polling only works if your backend updates the payment/intent status asynchronously after the user completes the widget flow.

## Backend configuration (reference from this repo)

If you want your other backend to behave like `ryde-backend`, it will need equivalents of these environment variables (names can differ):

```dotenv
IREMBOPAY_SECRET_KEY=sk_sandbox_your_secret_key
IREMBOPAY_PUBLIC_KEY=pk_sandbox_your_public_key
IREMBOPAY_ENVIRONMENT=sandbox  # sandbox | checkout | production
IREMBOPAY_ACCOUNT_ID=0780000000
IREMBOPAY_PRODUCT_ID=PC-your_product_id
```

Notes:

- The frontend only needs the **public** key (`REACT_APP_IPAY_PUBLIC_KEY`).
- The backend needs the **secret** key and business/account/product identifiers to create invoices.

## Quick “port to another website” checklist

- Add the IremboPay inline script to your new site’s HTML (sandbox/checkout/prod as needed).
- Add a public key env var on the frontend and pass it into `window.IremboPay.initiate`.
- Implement backend endpoints that:
  - Create invoices and return `invoiceNumber`
  - Store `invoiceNumber` mapped to your internal payment record
  - Receive webhook updates and mark payment `COMPLETED`/`FAILED`
  - Expose polling endpoints for the frontend to read status

