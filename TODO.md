# TODO - Fix console/runtime errors & payment flow

## Plan (approved)
1. Reproduce root cause of `SecurityError: Blocked a frame ... accessing a cross-origin frame` happening from the frontend.
2. Fix frontend code that touches `window/document` from within Razorpay iframe contexts (move Razorpay logic to a safe callback, avoid document usage after Razorpay opens).
3. Fix backend payment API authorization bugs causing 401/403/400:
   - Ensure booking/payment create-order validates `req.user` correctly.
   - Ensure webhook routes use correct payload signature verification and update booking/payment safely.
4. Fix socket.io disconnect issue and ensure notifications work:
   - Add reconnection options / delay.
   - Ensure socket server emits properly and CORS/origin config matches.
5. Add minimal tests / run builds and smoke-test checkout.

## Checklist
- [ ] Step 1: Identify where SecurityError originates in our code (search + inspect Razorpay integration)
- [ ] Step 2: Patch Razorpay integration in `Checkout.tsx` to avoid cross-frame document/window access
- [ ] Step 3: Patch auth handling for `/payments/razorpay/create-order` and ensure booking/payment ownership checks are consistent
- [ ] Step 4: Patch SocketContext connection options + backend CORS consistency
- [ ] Step 5: Run frontend+backend, verify checkout + payment + socket notifications

