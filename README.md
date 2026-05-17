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
