# Mis peliculas

Aplicacion pequena para practicar un CRUD completo:

- Frontend con TypeScript y Vite.
- Backend con Node y Express.
- Datos guardados en memoria.
- Sin `async` ni `await`.

## Usuarios de prueba

| Rol | Email | Password | Permisos |
| --- | --- | --- | --- |
| Admin | `admin@gmail.com` | `admin` | Alta, baja y modificacion de peliculas. Tambien puede ver todos los alquileres. |
| Usuario | `user1@gmail.com` | `pass` | Puede alquilar peliculas disponibles y ver sus alquileres. |
| Usuario | `user2@gmail.com` | `pass2` | Puede alquilar peliculas disponibles y ver sus alquileres. |

## Ejecutar

Instala y arranca el backend:

```bash
cd backend
npm install
npm run dev
```

Instala y arranca el frontend en otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://127.0.0.1:5173`.

## Desplegar en Vercel

El proyecto incluye `vercel.json` y una funcion serverless en `api/[...path].js`.

- En local, el frontend llama a `http://localhost:3000`.
- En Vercel, el frontend llama a `/api`.
- El backend exporta la app de Express para Vercel y solo abre puerto cuando se ejecuta con `node server.js` o `npm run dev`.

En Vercel puedes importar el repositorio y desplegarlo directamente desde la raiz del proyecto.
