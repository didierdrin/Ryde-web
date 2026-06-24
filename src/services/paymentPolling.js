import api from './api';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function paymentStatusOf(payment) {
  return (payment?.payment_status || payment?.paymentStatus || '').toString().toUpperCase();
}

function intentStatusOf(intent) {
  return (intent?.status || '').toString().toUpperCase();
}

/**
 * Poll until webhook updates payment status (Step 7 in IremboPay flow).
 */
export async function waitForTripPaymentCompleted(tripId, { maxMs = 90000, intervalMs = 2000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { payment } = await api.getPaymentByTrip(tripId);
    const status = paymentStatusOf(payment);
    if (status === 'COMPLETED') return 'COMPLETED';
    if (status === 'FAILED') return 'FAILED';
    await sleep(intervalMs);
  }
  return 'TIMEOUT';
}

export async function waitForRentalIntentCompleted(intentId, { maxMs = 90000, intervalMs = 2000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { intent } = await api.getRentalIntent(intentId);
    const status = intentStatusOf(intent);
    if (status === 'COMPLETED') return 'COMPLETED';
    if (status === 'FAILED') return 'FAILED';
    await sleep(intervalMs);
  }
  return 'TIMEOUT';
}

export function paymentOutcomeMessage(outcome, { successTrip, successRental, failed, timeout } = {}) {
  if (outcome === 'COMPLETED') {
    return successTrip || successRental || 'Payment successful!';
  }
  if (outcome === 'FAILED') {
    return failed || 'Payment was recorded as failed.';
  }
  return timeout || 'Payment is still processing. Pull to refresh or check again shortly.';
}
