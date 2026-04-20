# Todo List Monorepo

Este repositorio queda organizado como monorepo con tres carpetas principales:

- `frontend/`: aplicacion web en React + Vite.
- `backend/`: API en Go pensada para ejecutarse en Cloud Run.
- `infra/`: artefactos de infraestructura, Docker y Terraform.

Arquitectura objetivo:

- Frontend: React.
- Backend: Go.
- Autenticacion: Firebase Authentication con Google Sign-In.
- Base de datos: Cloud Firestore.
- Runtime serverless recomendado: Cloud Run.

Comandos utiles:

```powershell
cd frontend
npm run dev
```

```powershell
cd frontend
npm run build
```
