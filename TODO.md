# TODO - Fix login

- [x] Replace backend `vehicle-rental-backend/src/routes/auth.routes.ts` with correct auth endpoints wired to `controllers/auth.controller.ts`.
- [x] Update frontend `vehicle-rental-frontend/src/pages/Login.tsx` to stop reading `res.data.token` (cookie-based auth).

- [ ] (Optional) Run a quick smoke test: login -> verify `auth_token` cookie is set -> call `/api/user/profile`.

