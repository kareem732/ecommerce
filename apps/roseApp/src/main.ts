const paymentReturn = new URLSearchParams(window.location.search);
if (paymentReturn.has('pc')) {
  window.history.replaceState(null, '', '/shop/payment-cancel');
} else if (paymentReturn.has('session_id')) {
  window.history.replaceState(null, '', '/shop/payment-success' + window.location.search);
}

import('./bootstrap').catch((err) => console.error(err));
