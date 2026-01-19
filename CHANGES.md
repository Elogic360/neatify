Changelog - short summary of recent changes

2026-01-19

- Frontend: Added lightweight toast notification system integration and replaced blocking alert/confirm in key user flows:
  - Cart, Product Detail, HomePage: use toast for session expired, success/failure messages
  - Admin inventory/product pages: replaced alert with toast
  - Toast provider already mounted in `App.tsx` and available via `useToast()`

- Frontend: Guest checkout flow updated to only clear cart when server returns `clear_client_cart` flag; order number shown on confirmation.

- Backend: Added `clear_client_cart` flag to Order responses (both user and guest flows) and updated guest endpoint response.

- Backend: Added request exception logging middleware to `app/main.py` to capture unhandled exceptions and stack traces for easier debugging of ROLLBACKs.

- Tests: Added assertions to order tests to verify presence of `clear_client_cart`.

Notes:
- Please run the test suite (`pytest`) in the backend to confirm all changes pass.
- Suggested branch name: `feature/toasts-and-order-safety`
- Suggested commit message:
  "feat(frontend): show toast messages and safely clear cart after confirmed order; feat(backend): add clear_client_cart in order responses and exception logging"

Deployment steps:
1. git checkout -b feature/toasts-and-order-safety
2. git add . && git commit -m "feat(frontend): show toast messages and safely clear cart after confirmed order; feat(backend): add clear_client_cart in order responses and exception logging"
3. git push origin feature/toasts-and-order-safety
4. Open a PR on GitHub and request review

If you'd like, I can create the PR draft text for you to paste into GitHub.
