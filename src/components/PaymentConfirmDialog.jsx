import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import { paymentOutcomeMessage } from '../services/paymentPolling';

/**
 * Shows a blocking dialog while polling the backend for webhook-confirmed payment status.
 */
const PaymentConfirmDialog = ({ open, title, poll, successMessage, onClose, onOutcome }) => {
  const [phase, setPhase] = useState('polling');
  const [message, setMessage] = useState('Confirming your payment…');

  useEffect(() => {
    if (!open || !poll) return undefined;

    let cancelled = false;
    setPhase('polling');
    setMessage('Confirming your payment…');

    (async () => {
      try {
        const outcome = await poll();
        if (cancelled) return;
        const text = paymentOutcomeMessage(outcome, {
          successTrip: successMessage,
          successRental: successMessage,
        });
        setMessage(text);
        setPhase(outcome === 'COMPLETED' ? 'success' : outcome === 'FAILED' ? 'failed' : 'timeout');
        onOutcome?.(outcome);
      } catch (e) {
        if (cancelled) return;
        setMessage(e.message || 'Could not verify payment status.');
        setPhase('failed');
        onOutcome?.('ERROR');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, poll, successMessage, onOutcome]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title || 'Payment'}</h3>
        <div className="flex flex-col items-center gap-3 py-4">
          {phase === 'polling' && (
            <>
              <Loader className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-600 text-sm">{message}</p>
              <p className="text-xs text-gray-400">Waiting for payment confirmation from the server…</p>
            </>
          )}
          {phase === 'success' && (
            <>
              <CheckCircle className="text-green-600" size={48} />
              <p className="text-green-800 font-medium">{message}</p>
            </>
          )}
          {(phase === 'failed' || phase === 'timeout') && (
            <>
              <XCircle className={phase === 'timeout' ? 'text-amber-500' : 'text-red-600'} size={48} />
              <p className="text-gray-800">{message}</p>
            </>
          )}
        </div>
        {phase !== 'polling' && (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmDialog;
