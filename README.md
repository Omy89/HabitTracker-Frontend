# Habit Tracker — Frontend (Avance 2)

Frontend en **Next.js (App Router) + Material UI** para el proyecto Habit
Tracker, cubriendo las pantallas funcionales pedidas en la **Entrega 2**:

- Login
- Registro (con validación en tiempo real)
- Dashboard básico (rachas, % de cumplimiento, gráficas semanal/mensual)
- Lista de hábitos (crear, editar, eliminar, activar/desactivar, marcar
  como completado hoy)
- Crear / Editar hábito (mismo formulario, en un diálogo modal)
- Estadísticas y Perfil (adelantadas, ya que el sidebar del Avance 1 las
  contempla como navegación permanente)

## ⚠️ Alcance: solo frontend, con datos simulados

Este avance es **solo la interfaz**, tal como se pidió. Como todavía no
existe el backend de NestJS + MongoDB, toda la persistencia (usuarios,
hábitos, registros diarios) vive en `lib/mockApi.js` y se guarda en
`localStorage` del navegador para que la app se sienta completa y
funcional mientras la usas (crear cuenta, iniciar sesión, crear hábitos,
marcar días, ver rachas y gráficas, todo persiste al recargar).

**Importante para la Entrega 2 real:** el enunciado pide que la entrega
funcional NO use mock data para las funcionalidades principales. Por eso
`lib/mockApi.js` está diseñado como una capa aislada: cada función tiene
la misma firma que tendrá la futura llamada a la API REST (recibe los
mismos parámetros, regresa una `Promise`, puede fallar con un `Error`).
Cuando el backend esté listo, solo hay que reemplazar el contenido de esas
funciones por `fetch(...)` contra NestJS — los componentes y los Contexts
(`AuthContext`, `HabitsContext`) no necesitan cambiar.

Hay un usuario de ejemplo precargado para probar sin registrarte:

```
correo: andrea@example.com
contraseña: 123456
```

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — te redirige a `/login` si no hay sesión, o a
`/dashboard` si ya iniciaste sesión antes (la sesión se guarda en
`localStorage`).

## Estructura

```
app/
  login/page.js            Pantalla de inicio de sesión
  register/page.js         Pantalla de registro con validación en tiempo real
  (app)/layout.js          Layout protegido: Sidebar + Navbar + guard de auth
  (app)/dashboard/page.js  Dashboard: cards, % cumplimiento, gráficas
  (app)/habits/page.js     Lista de hábitos + FAB para crear
  (app)/statistics/page.js Estadísticas generales
  (app)/profile/page.js    Datos de cuenta, cambio de contraseña, resumen
components/
  Sidebar.js, Topbar.js     Navegación
  HabitFormDialog.js        Formulario de crear/editar hábito (modal)
  ConfirmDialog.js          Confirmación antes de eliminar
  EmptyState.js, StatCard.js, AuthLayout.js
context/
  AuthContext.js            Sesión de usuario
  HabitsContext.js          Estado de hábitos (CRUD, toggle, etc.)
lib/
  mockApi.js                Capa de datos simulada (ver nota arriba)
  theme.js                  Tema de Material UI (paleta, tipografía, forma)
  EmotionRegistry.js         Integración de Emotion con el App Router
```

## Sistema de diseño aplicado

Tomado directamente del Avance 1: fondo casi blanco, azul (#2563EB) como
color principal, azul oscuro en hover, grises para texto secundario,
verde/rojo/ámbar para estados. Tipografía Roboto, íconos Material Icons,
componentes con bordes redondeados y sombras suaves (cards, diálogos,
chips, badges, barras de progreso, gráficas).

## Pendiente para próximas entregas

- Conectar con el backend real (Auth, Users, Habits, Statistics en NestJS)
  y quitar `mockApi.js`.
- Filtros por rango de fechas y comparativas entre meses en Estadísticas
  (Entrega 3).
- Pruebas de usabilidad y accesibilidad más profundas.
